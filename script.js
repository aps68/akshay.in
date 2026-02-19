document.addEventListener('DOMContentLoaded', () => {

    // --- Custom Cursor ---
    const cursor = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // --- Stats Counter Animation ---
    const stats = document.querySelectorAll('.stat-number');
    const speed = 200; // The lower the slower

    const animateStats = () => {
        stats.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }

    // --- Scroll Intersection Observer ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.querySelector('.stat-number')) {
                    animateStats();
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
        observer.observe(section);
    });

    // --- Canvas Background Animation ---
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray;

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = '#00ffa3';
            ctx.globalAlpha = 0.5;
            ctx.fill();
        }
        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 15000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            let color = '#00ffa3';

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                    ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(0, 255, 163,' + opacityValue + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });

    init();
    animate();

    // --- Load P&L Data ---
    const PNL_DATA = {
        "summary": {
            "total_pnl": 31515.0,
            "total_trades": 137,
            "win_rate": 67.88,
            "avg_profit": 1092.30,
            "avg_loss": -1592.47,
            "max_drawdown": -9881.25
        }
    };

    function loadPNL() {
        try {
            const summary = PNL_DATA.summary;

            // Main PNL
            const mainPnlEl = document.querySelector('.main-pnl .pnl-value');
            if (mainPnlEl) {
                const pnl = summary.total_pnl;
                mainPnlEl.innerText = (pnl >= 0 ? "+" : "") + "₹" + Math.round(pnl).toLocaleString();
                mainPnlEl.className = 'pnl-value ' + (pnl >= 0 ? 'positive' : 'negative');
            }

            // Win Rate
            const winRateStr = summary.win_rate + "%";
            const winRateEl = document.getElementById('win-rate');
            const winRateBar = document.getElementById('win-rate-bar');
            if (winRateEl) winRateEl.innerText = winRateStr;
            if (winRateBar) winRateBar.style.width = winRateStr;

            // Total Trades
            const totalTradesEl = document.getElementById('total-trades');
            if (totalTradesEl) totalTradesEl.innerText = summary.total_trades;

            // Avg Profit
            const avgProfitEl = document.getElementById('avg-profit');
            if (avgProfitEl) avgProfitEl.innerText = "₹" + Math.round(summary.avg_profit).toLocaleString();

            // Avg Loss
            const avgLossEl = document.getElementById('avg-loss');
            if (avgLossEl) avgLossEl.innerText = "₹" + Math.round(summary.avg_loss).toLocaleString();

        } catch (e) {
            console.error("Error loading P&L:", e);
        }
    }

    loadPNL();

    // --- Certificate Modal Logic ---
    const modal = document.getElementById("cert-modal");
    const pdfContainer = document.getElementById("pdf-container");

    // Open Modal
    document.querySelectorAll('.cert-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const src = link.getAttribute('href');

            // Basic Embed
            pdfContainer.innerHTML = `<embed src="${src}" type="application/pdf" width="100%" height="100%" />`;

            if (modal) modal.style.display = "block";
        });
    });

    // Close Modal
    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) {
        closeBtn.onclick = () => {
            if (modal) modal.style.display = "none";
            if (pdfContainer) pdfContainer.innerHTML = "";
        }
    }

    // Click outside to close
    window.onclick = (event) => {
        if (event.target == modal) {
            if (modal) modal.style.display = "none";
            if (pdfContainer) pdfContainer.innerHTML = "";
        }
    }
});
