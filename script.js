// やさしいフェードインのために監視オプションの閾値を調整
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// スクロール時のフェードインアニメーション (Intersection Observer API を使用)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // 少し早めにアニメーションを開始して、ゆっくり表示させる
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // 一度だけアニメーションさせる（やさしい印象を保つため何度もチカチカさせない）
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(element => {
        observer.observe(element);
    });
    
    // スムーズスクロールの設定（ゆっくりとスクロール）
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // お問い合わせフォームの送信処理
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            submitBtn.textContent = '送信中...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    contactForm.style.display = 'none';
                    formSuccess.style.display = 'block';
                } else {
                    alert('送信に失敗しました。お手数ですが info@office-kit.jp へ直接ご連絡ください。');
                    submitBtn.textContent = '送信する';
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                }
            } catch (error) {
                alert('送信に失敗しました。お手数ですが info@office-kit.jp へ直接ご連絡ください。');
                submitBtn.textContent = '送信する';
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        });
    }
});
