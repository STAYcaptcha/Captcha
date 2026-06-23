(function(global) {
    'use strict';

    const DEFAULTS = {
        container: null,
        onSuccess: null,
        onFail: null,
        duration: 5000,
        language: 'zh-CN'
    };

    const LANG = {
        'zh-CN': {
            title: '证明你不是机器人',
            hint: '长按该按钮',
            press: '按住',
            pleaseWait: '请稍候',
            pressAgain: '再次按下',
            retry: '请再试一次',
            verified: '已完成人机验证',
            success: '已通过',
            accessibility: '可访问性挑战'
        },
        'en': {
            title: 'Prove you are not a robot',
            hint: 'Press and hold the button',
            press: 'Hold',
            pleaseWait: 'Please wait',
            pressAgain: 'Press again',
            retry: 'Please try again',
            verified: 'Verification complete',
            success: 'Verified',
            accessibility: 'Accessibility Challenge'
        }
    };

    const STYLES = `
        .stay-captcha * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            -webkit-user-drag: none;
            user-drag: none;
        }

        .stay-captcha {
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
            -webkit-touch-callout: none;
            display: contents;
        }

        /* ===== 顶部条形 ===== */
        .stay-captcha .top-bar {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 360px;
            height: 92px;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.14);
            display: flex;
            align-items: center;
            padding: 0 24px;
            gap: 16px;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
        }
        .stay-captcha .top-bar.show {
            opacity: 1;
            visibility: visible;
        }

        .stay-captcha .custom-checkbox {
            width: 34px;
            height: 34px;
            flex-shrink: 0;
            border-radius: 6px;
            border: 2.5px solid #b0b0b0;
            background: #ffffff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.25s ease;
            position: relative;
        }
        .stay-captcha .custom-checkbox:hover {
            border-color: #2b6ef0;
        }
        .stay-captcha .custom-checkbox.loading {
            border-color: transparent;
            background: transparent;
            cursor: default;
        }
        .stay-captcha .custom-checkbox.loading .spinner {
            display: block;
        }
        .stay-captcha .custom-checkbox.loading .check-icon {
            display: none;
        }
        .stay-captcha .custom-checkbox.done {
            border-color: transparent;
            background: #ffffff;
            cursor: default;
        }
        .stay-captcha .custom-checkbox.done .check-icon {
            display: block;
        }
        .stay-captcha .custom-checkbox.done .spinner {
            display: none;
        }

        .stay-captcha .custom-checkbox .check-icon {
            display: none;
            width: 32px;
            height: 32px;
            stroke: #22c55e;
            stroke-width: 4;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
            animation: stay-checkFlip 1s ease forwards;
            transform-origin: center;
        }
        @keyframes stay-checkFlip {
            0% { transform: rotateX(90deg); opacity: 0; }
            100% { transform: rotateX(0deg); opacity: 1; }
        }

        .stay-captcha .custom-checkbox .spinner {
            display: none;
            width: 26px;
            height: 26px;
            border: 3px solid #2b6ef0;
            border-top-color: transparent;
            border-radius: 50%;
            animation: stay-spin 0.7s linear infinite;
        }
        @keyframes stay-spin {
            to { transform: rotate(360deg); }
        }

        .stay-captcha .bar-text {
            font-size: 1.1rem;
            font-weight: 500;
            color: #1e1e1e;
            flex: 1;
            text-align: left;
            white-space: nowrap;
        }

        .stay-captcha .bar-logo {
            flex-shrink: 0;
            width: 60px;
            height: 60px;
        }
        .stay-captcha .bar-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
            -webkit-user-drag: none;
            user-drag: none;
        }

        /* ===== 弹窗 ===== */
        .stay-captcha .floating-modal {
            max-width: 360px;
            width: 90%;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.08);
            margin: 0 auto;
            overflow: hidden;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), max-width 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), height 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), opacity 0.3s ease, visibility 0.3s ease;
            opacity: 0;
            visibility: hidden;
            z-index: 10000;
        }
        .stay-captcha .floating-modal.ready {
            opacity: 1;
            visibility: visible;
        }
        .stay-captcha .floating-modal.closed {
            opacity: 0;
            visibility: hidden;
        }

        .stay-captcha .modal-content {
            padding: 28px 20px 28px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .stay-captcha .container {
            width: 100%;
            text-align: center;
        }

        .stay-captcha .container h2 {
            margin-bottom: 20px;
            font-size: 1.5rem;
            font-weight: bold;
            color: #1e1e1e;
        }

        .stay-captcha .container > img {
            display: block;
            margin: 0 auto 20px auto;
            pointer-events: auto;
            -webkit-user-drag: none;
            user-drag: none;
            -webkit-user-select: none;
            user-select: none;
            max-width: 100%;
            height: auto;
        }

        .stay-captcha .container h5 {
            font-weight: normal;
            margin-bottom: 32px;
            color: #6b6b6b;
            font-size: 1rem;
        }

        .stay-captcha .buttons-row {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            gap: 16px;
            width: 100%;
        }

        .stay-captcha .accessibility-btn {
            position: relative;
            width: 44px;
            height: 44px;
            background-color: #6b6b6b;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
            flex-shrink: 0;
            overflow: visible;
        }
        .stay-captcha .accessibility-btn.lighten {
            background-color: #c0c0c0;
        }
        .stay-captcha .accessibility-btn img {
            width: 28px;
            height: 28px;
            display: block;
            margin: 0;
            object-fit: contain;
        }

        .stay-captcha .static-chat-tooltip {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 100%;
            margin-bottom: 12px;
            background-color: #ffffff;
            color: #000000;
            border: 1.5px solid #d1d5db;
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: normal;
            white-space: nowrap;
            z-index: 20;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
        }
        .stay-captcha .static-chat-tooltip::before {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 6px;
            border-style: solid;
            border-color: #d1d5db transparent transparent transparent;
        }
        .stay-captcha .static-chat-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 5px;
            border-style: solid;
            border-color: #ffffff transparent transparent transparent;
            margin-top: -1px;
        }
        .stay-captcha .static-chat-tooltip.show {
            opacity: 1;
            visibility: visible;
        }

        .stay-captcha .accessibility-btn .tooltip-dialog {
            position: absolute;
            left: 100%;
            right: auto;
            top: 50%;
            transform: translateY(-50%);
            margin-left: 12px;
            background-color: #ffffff;
            color: #000000;
            border: 1.5px solid #d1d5db;
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: normal;
            white-space: nowrap;
            z-index: 20;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            pointer-events: none;
            transition: opacity 0.2s ease;
            opacity: 0;
            visibility: hidden;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
        }
        .stay-captcha .accessibility-btn:hover .tooltip-dialog {
            opacity: 1;
            visibility: visible;
        }

        .stay-captcha .verify-section {
            margin-top: 0;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 220px;
            margin-left: auto;
            margin-right: auto;
        }

        .stay-captcha .long-press-btn {
            position: relative;
            width: 100%;
            height: 44px;
            border-radius: 100px;
            background-color: white;
            border: 2px solid #2b6ef0;
            cursor: pointer;
            overflow: hidden;
            margin: 0;
            transition: background-color 0.2s ease, border-color 0.2s ease;
            user-select: none;
        }
        .stay-captcha .long-press-btn .fill-progress {
            position: absolute;
            top: 0;
            left: 0;
            width: 0%;
            height: 100%;
            background-color: #2b6ef0;
            border-radius: 0;
            pointer-events: none;
            z-index: 1;
        }
        .stay-captcha .long-press-btn .btn-text {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            font-weight: 600;
            color: #2b6ef0;
            background: transparent;
            user-select: none;
        }

        .stay-captcha .retry-message {
            margin-top: 6px;
            font-size: 0.83rem;
            font-weight: normal;
            color: #e53e3e;
            text-align: left;
            width: 100%;
            opacity: 0;
            transition: opacity 0.2s;
            font-family: inherit;
            user-select: none;
        }
        .stay-captcha .retry-message.show {
            opacity: 1;
        }

        .stay-captcha .fullscreen-success {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            visibility: hidden;
            opacity: 0;
            transition: visibility 0s, opacity 0.3s ease;
            user-select: none;
            border-radius: 20px;
        }
        .stay-captcha .fullscreen-success.show {
            visibility: visible;
            opacity: 1;
        }
        .stay-captcha .success-circle {
            width: 120px;
            height: 120px;
            background-color: #22c55e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .stay-captcha .success-circle svg {
            width: 70px;
            height: 70px;
            stroke: #ffffff;
            stroke-width: 5;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .stay-captcha .success-text {
            font-size: 2rem;
            font-weight: bold;
            color: #000000;
            user-select: none;
        }

        .stay-captcha .loading-dots {
            display: flex;
            gap: 6px;
            justify-content: center;
            align-items: center;
        }
        .stay-captcha .loading-dots span {
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
            animation: stay-blink 1.2s infinite ease-in-out;
        }
        .stay-captcha .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .stay-captcha .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes stay-blink {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
        }

        .stay-captcha .preload-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            z-index: 10;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .stay-captcha .preload-wrapper.hide {
            opacity: 0;
            visibility: hidden;
        }

        .stay-captcha .preload-content {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }

        .stay-captcha .preload-dots {
            display: flex;
            gap: 10px;
            justify-content: center;
            align-items: center;
        }
        .stay-captcha .preload-dots span {
            width: 12px;
            height: 12px;
            background-color: #6b6b6b;
            border-radius: 50%;
            animation: stay-blink 1.2s infinite ease-in-out;
        }
        .stay-captcha .preload-dots span:nth-child(2) { animation-delay: 0.2s; }
        .stay-captcha .preload-dots span:nth-child(3) { animation-delay: 0.4s; }

        .stay-captcha .main-content-wrapper {
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease 0.1s, visibility 0.3s ease 0.1s;
        }
        .stay-captcha .main-content-wrapper.visible {
            opacity: 1;
            visibility: visible;
        }

        .stay-captcha .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9998;
            display: none;
        }
        .stay-captcha .modal-overlay.show {
            display: block;
        }
    `;

    // ============ 主类 ============
    class STAYcaptchaInstance {
        constructor(config) {
            this.config = Object.assign({}, DEFAULTS, config);
            this.lang = LANG[this.config.language] || LANG['zh-CN'];

            this.isVerified = false;
            this.isModalOpen = false;
            this.checkboxLoading = false;
            this.isInVerification = false;

            this.stepInterval = null;
            this.isPressing = false;
            this.hasMoved = false;
            this.startX = 0;
            this.startY = 0;
            this.startTimestamp = 0;
            this.currentFillPercent = 0;
            this.REQUIRED_DURATION = this.config.duration || 5000;

            this.awaitingSecondPress = false;
            this.autoPressHasMoved = false;
            this.autoPressStartX = 0;
            this.autoPressStartY = 0;

            this.rootEl = null;
            this.topBar = null;
            this.mainCheckbox = null;
            this.barText = null;
            this.modalOverlay = null;
            this.floatingModal = null;
            this.preloadWrapper = null;
            this.mainContentWrapper = null;
            this.pressBtn = null;
            this.fillProgress = null;
            this.btnTextDiv = null;
            this.textSpan = null;
            this.retryMsgDiv = null;
            this.fullscreenDiv = null;
            this.accessBtn = null;
            this.staticChatTooltip = null;

            this._injectStyles();
            this._render();
            this._bindEvents();
            this._showTopBar();
        }

        _injectStyles() {
            if (document.getElementById('stay-captcha-styles')) return;
            const styleEl = document.createElement('style');
            styleEl.id = 'stay-captcha-styles';
            styleEl.textContent = STYLES;
            document.head.appendChild(styleEl);
        }

        _render() {
            const container = document.querySelector(this.config.container);
            if (!container) {
                console.error('[STAYcaptcha] 容器未找到: ' + this.config.container);
                return;
            }
            container.innerHTML = '';
            const root = document.createElement('div');
            root.className = 'stay-captcha';
            root.innerHTML = this._getTemplate();
            container.appendChild(root);
            this.rootEl = root;

            this.topBar = root.querySelector('.top-bar');
            this.mainCheckbox = root.querySelector('.custom-checkbox');
            this.barText = root.querySelector('.bar-text');
            this.modalOverlay = root.querySelector('.modal-overlay');
            this.floatingModal = root.querySelector('.floating-modal');
            this.preloadWrapper = root.querySelector('.preload-wrapper');
            this.mainContentWrapper = root.querySelector('.main-content-wrapper');
            this.pressBtn = root.querySelector('.long-press-btn');
            this.fillProgress = root.querySelector('.fill-progress');
            this.btnTextDiv = root.querySelector('.btn-text');
            this.textSpan = root.querySelector('.text-span');
            this.retryMsgDiv = root.querySelector('.retry-message');
            this.fullscreenDiv = root.querySelector('.fullscreen-success');
            this.accessBtn = root.querySelector('.accessibility-btn');
            this.staticChatTooltip = root.querySelector('.static-chat-tooltip');

            this._applyLanguage();
        }

        _getTemplate() {
            return `
                <div class="top-bar">
                    <div class="custom-checkbox">
                        <svg class="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <div class="spinner"></div>
                    </div>
                    <span class="bar-text" data-key="title">证明你不是机器人</span>
                    <div class="bar-logo">
                        <img src="https://s41.ax1x.com/2026/05/17/pex9GCQ.png" alt="" draggable="false">
                    </div>
                </div>

                <div class="modal-overlay"></div>

                <div class="floating-modal closed">
                    <div class="preload-wrapper">
                        <div class="preload-content">
                            <div class="preload-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                    <div class="main-content-wrapper">
                        <div class="modal-content">
                            <div class="container">
                                <h2 data-key="title">证明你不是机器人</h2>
                                <img src="https://s41.ax1x.com/2026/05/17/pex9GCQ.png" alt="" draggable="false">
                                <h5 data-key="hint">长按该按钮</h5>

                                <div class="buttons-row">
                                    <div class="accessibility-btn">
                                        <img src="https://s41.ax1x.com/2026/05/17/pevReZ8.png" alt="accessibility" draggable="false">
                                        <div class="static-chat-tooltip" data-key="accessibility">可访问性挑战</div>
                                        <div class="tooltip-dialog" data-key="accessibility">可访问性挑战</div>
                                    </div>

                                    <div class="verify-section" style="width:220px; margin:0;">
                                        <div class="long-press-btn">
                                            <div class="fill-progress"></div>
                                            <div class="btn-text">
                                                <span class="text-span" data-key="press">按住</span>
                                            </div>
                                        </div>
                                        <div class="retry-message" data-key="retry">请再试一次</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="fullscreen-success">
                            <div class="success-circle">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="success-text" data-key="success">已通过</div>
                        </div>
                    </div>
                </div>
            `;
        }

        _applyLanguage() {
            const els = this.rootEl.querySelectorAll('[data-key]');
            els.forEach(el => {
                const key = el.getAttribute('data-key');
                if (this.lang[key] !== undefined) {
                    el.textContent = this.lang[key];
                }
            });
        }

        _showTopBar() {
            if (this.topBar) {
                this.topBar.classList.add('show');
            }
        }

        _bindEvents() {
            this.mainCheckbox.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.isVerified) return;
                if (this.checkboxLoading) return;
                if (this.isInVerification) return;

                this.checkboxLoading = true;
                this.isInVerification = true;
                this.mainCheckbox.classList.add('loading');

                setTimeout(() => {
                    this.checkboxLoading = false;
                    this._openModal();
                }, 2000);
            });

            this.modalOverlay.addEventListener('click', (e) => {
                if (e.target === this.modalOverlay) {
                    this._closeModal();
                }
            });

            this.accessBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isVerified) return;
                this.accessBtn.classList.add('lighten');
                this._startAutoPress();
            });

            this.pressBtn.addEventListener('pointerdown', (e) => {
                this._onPointerDown(e);
            });
            this.pressBtn.addEventListener('dragstart', (e) => e.preventDefault());

            window.addEventListener('mousemove', (e) => {
                window._stayLastMouseX = e.clientX;
                window._stayLastMouseY = e.clientY;
            });
            window._stayLastMouseX = window.innerWidth / 2;
            window._stayLastMouseY = window.innerHeight / 2;
        }

        _openModal() {
            if (this.isVerified) return;
            if (this.isModalOpen) return;

            this.isModalOpen = true;
            this.modalOverlay.classList.add('show');

            this.floatingModal.classList.remove('closed');
            this.floatingModal.style.opacity = '0';
            this.floatingModal.style.visibility = 'hidden';

            setTimeout(() => {
                this.floatingModal.style.opacity = '1';
                this.floatingModal.style.visibility = 'visible';
                this.floatingModal.classList.add('ready');
                this._triggerModalEntrance();
            }, 50);
        }

        _triggerModalEntrance() {
            const smallHeight = 100;
            const smallWidth = 160;

            this.floatingModal.style.transition = 'none';
            this.floatingModal.style.width = smallWidth + 'px';
            this.floatingModal.style.maxWidth = smallWidth + 'px';
            this.floatingModal.style.height = smallHeight + 'px';

            this.floatingModal.offsetHeight;

            this.floatingModal.style.transition = 'width 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), max-width 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), height 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), opacity 0.01s ease, visibility 0.01s ease';
            this.floatingModal.style.opacity = '1';
            this.floatingModal.style.visibility = 'visible';
            this.floatingModal.classList.add('ready');

            setTimeout(() => {
                this.floatingModal.style.width = '';
                this.floatingModal.style.maxWidth = '';
                this.floatingModal.style.width = '90%';
                this.floatingModal.style.maxWidth = '360px';

                const modalContent = this.floatingModal.querySelector('.modal-content');
                const targetHeight = modalContent ? modalContent.offsetHeight + 56 : 420;
                this.floatingModal.style.height = targetHeight + 'px';

                setTimeout(() => {
                    this.preloadWrapper.classList.add('hide');
                    this.mainContentWrapper.classList.add('visible');
                    this._showStaticTooltip();
                    this.floatingModal.style.height = '';
                }, 400);
            }, 2000);
        }

        _closeModal() {
            if (!this.isModalOpen) return;
            this.isModalOpen = false;
            this.modalOverlay.classList.remove('show');

            this.floatingModal.classList.remove('ready');
            this.floatingModal.classList.add('closed');
            this.floatingModal.style.opacity = '0';
            this.floatingModal.style.visibility = 'hidden';

            this._resetPressState(true, false);
            this.fullscreenDiv.classList.remove('show');
            this.preloadWrapper.classList.remove('hide');
            this.mainContentWrapper.classList.remove('visible');

            if (!this.isVerified) {
                this.mainCheckbox.classList.remove('loading', 'done');
                this.isInVerification = false;
            }
        }

        _handleVerificationSuccess() {
            this.isVerified = true;
            this.isModalOpen = false;
            this.isInVerification = false;
            this.modalOverlay.classList.remove('show');

            this.floatingModal.classList.remove('ready');
            this.floatingModal.classList.add('closed');
            this.floatingModal.style.opacity = '0';
            this.floatingModal.style.visibility = 'hidden';

            this.mainCheckbox.classList.remove('loading');
            void this.mainCheckbox.offsetWidth;
            requestAnimationFrame(() => {
                this.mainCheckbox.classList.add('done');
            });

            this.barText.textContent = this.lang.verified;

            this._resetPressState(true, false);
            this.fullscreenDiv.classList.remove('show');
            this.preloadWrapper.classList.remove('hide');
            this.mainContentWrapper.classList.remove('visible');

            if (typeof this.config.onSuccess === 'function') {
                this.config.onSuccess();
            }
        }

        _handleVerificationFail() {
            this._resetPressState(true, true);
            this.retryMsgDiv.classList.add('show');
            this.accessBtn.classList.remove('lighten');

            if (typeof this.config.onFail === 'function') {
                this.config.onFail();
            }
        }

        _showStaticTooltip() {
            if (this.staticChatTooltip) {
                this.staticChatTooltip.classList.add('show');
            }
        }

        _hideStaticTooltip() {
            if (this.staticChatTooltip) {
                this.staticChatTooltip.classList.remove('show');
            }
        }

        _startAutoPress() {
            if (this.fullscreenDiv.classList.contains('show')) return;
            this._hideStaticTooltip();
            if (this.isPressing) {
                this._resetPressState(true, false);
            }
            if (window._stayFlipTimer) clearTimeout(window._stayFlipTimer);
            if (window._stayLoadingTimer) clearTimeout(window._stayLoadingTimer);
            if (window._staySecondPressHandler) {
                this.pressBtn.removeEventListener('click', window._staySecondPressHandler);
            }
            this._resetPressState(true, false);
            this.awaitingSecondPress = false;

            let autoStartX, autoStartY;
            const rect = this.pressBtn.getBoundingClientRect();
            autoStartX = rect.left + rect.width / 2;
            autoStartY = rect.top + rect.height / 2;

            if (window._stayLastMouseX !== undefined && window._stayLastMouseY !== undefined) {
                autoStartX = window._stayLastMouseX;
                autoStartY = window._stayLastMouseY;
            }

            this.isPressing = true;
            this.hasMoved = false;
            this.autoPressHasMoved = false;
            this.startX = autoStartX;
            this.startY = autoStartY;
            this.autoPressStartX = autoStartX;
            this.autoPressStartY = autoStartY;
            this.startTimestamp = Date.now();

            this.textSpan.innerHTML = this.lang.pleaseWait;
            this.textSpan.style.fontSize = '';
            this.textSpan.style.transform = '';
            this.textSpan.style.display = '';
            const oldLoader = this.textSpan.querySelector('.loading-dots');
            if (oldLoader) oldLoader.remove();
            this.btnTextDiv.style.color = '#2b6ef0';
            this.pressBtn.style.backgroundColor = 'white';
            this.pressBtn.style.border = '2px solid #2b6ef0';

            this._startFillAnimationAuto();

            window.addEventListener('mousemove', this._autoMoveHandler.bind(this));
            window.addEventListener('mouseup', this._autoCancelHandler.bind(this));
        }

        _autoMoveHandler(e) {
            if (!this.isPressing) return;
            if (Math.abs(e.clientX - this.startX) > 3 || Math.abs(e.clientY - this.startY) > 3) {
                if (!this.hasMoved) {
                    this.hasMoved = true;
                    this.autoPressHasMoved = true;
                }
            }
            window._stayLastMouseX = e.clientX;
            window._stayLastMouseY = e.clientY;
        }

        _autoCancelHandler(e) {}

        _stopAutoDetection() {
            window.removeEventListener('mousemove', this._autoMoveHandler.bind(this));
            window.removeEventListener('mouseup', this._autoCancelHandler.bind(this));
        }

        _startFillAnimationAuto() {
            if (this.stepInterval) clearInterval(this.stepInterval);
            this.currentFillPercent = 0;
            this.fillProgress.style.width = '0%';
            this.startTimestamp = Date.now();
            this.stepInterval = setInterval(() => {
                if (!this.isPressing) return;
                const elapsed = Date.now() - this.startTimestamp;
                let percent = (elapsed / this.REQUIRED_DURATION) * 100;
                if (percent >= 100) {
                    percent = 100;
                    this.fillProgress.style.width = '100%';
                    this.btnTextDiv.style.color = 'white';
                    if (this.stepInterval) clearInterval(this.stepInterval);
                    this.stepInterval = null;
                    if (this.isPressing) {
                        this.isPressing = false;
                        this._stopAutoDetection();
                        this._waitForSecondPress();
                    }
                    return;
                }
                this.currentFillPercent = percent;
                this.fillProgress.style.width = percent + '%';
                const ratio = Math.min(1, percent / 100);
                const r = 43 + (255 - 43) * ratio;
                const g = 110 + (255 - 110) * ratio;
                const b = 240 + (255 - 240) * ratio;
                this.btnTextDiv.style.color = `rgb(${r}, ${g}, ${b})`;
            }, 30);
        }

        _waitForSecondPress() {
            if (this.stepInterval) clearInterval(this.stepInterval);
            this.stepInterval = null;
            this.isPressing = false;
            this.textSpan.innerHTML = this.lang.pressAgain;
            this.textSpan.style.transform = '';
            this.textSpan.style.display = '';
            this.btnTextDiv.style.color = 'white';
            this.fillProgress.style.width = '100%';
            this.awaitingSecondPress = true;

            const handler = (e) => {
                e.preventDefault();
                if (this.awaitingSecondPress) {
                    this.pressBtn.removeEventListener('click', handler);
                    this._continueWithSecondPress();
                }
            };
            this.pressBtn.addEventListener('click', handler);
            window._staySecondPressHandler = handler;
        }

        _continueWithSecondPress() {
            this.awaitingSecondPress = false;
            if (this.autoPressHasMoved) {
                this._successWithAnimation();
            } else {
                this._failWithAnimation();
            }
        }

        _onLongPressComplete() {
            this.fillProgress.style.width = '100%';
            this.btnTextDiv.style.color = 'white';
            if (this.stepInterval) clearInterval(this.stepInterval);
            if (this.hasMoved) {
                this._successWithAnimation();
            } else {
                this._failWithAnimation();
            }
        }

        _successWithAnimation() {
            if (this.stepInterval) clearInterval(this.stepInterval);
            this.isPressing = false;
            this._startAnimationAndThen(true);
        }

        _failWithAnimation() {
            if (this.stepInterval) clearInterval(this.stepInterval);
            this.isPressing = false;
            this._startAnimationAndThen(false);
        }

        _startAnimationAndThen(isSuccess) {
            this.textSpan.style.transition = 'transform 0.25s ease';
            this.textSpan.style.display = 'inline-flex';
            this.textSpan.style.alignItems = 'center';
            this.textSpan.style.justifyContent = 'center';
            this.textSpan.style.transform = 'rotateX(90deg)';

            setTimeout(() => {
                this.textSpan.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block; margin:0 auto;"><path d="M20 6L9 17L4 12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                this.textSpan.style.transform = 'rotateX(0deg)';
                this.textSpan.style.fontSize = 'inherit';

                window._stayFlipTimer = setTimeout(() => {
                    this.textSpan.style.transform = 'rotateX(90deg)';
                    setTimeout(() => {
                        this.textSpan.innerHTML = '';
                        const loaderDiv = document.createElement('div');
                        loaderDiv.className = 'loading-dots';
                        loaderDiv.innerHTML = '<span></span><span></span><span></span>';
                        this.textSpan.appendChild(loaderDiv);
                        this.textSpan.style.transform = 'rotateX(0deg)';
                        this.textSpan.style.display = 'flex';
                        this.textSpan.style.alignItems = 'center';
                        this.textSpan.style.justifyContent = 'center';

                        window._stayLoadingTimer = setTimeout(() => {
                            if (isSuccess) {
                                this._handleVerificationSuccess();
                            } else {
                                this._handleVerificationFail();
                            }
                        }, 3000);
                    }, 200);
                }, 800);
            }, 200);
        }

        _resetPressState(resetFill = true, keepRetryMessage = false) {
            if (this.stepInterval) {
                clearInterval(this.stepInterval);
                this.stepInterval = null;
            }
            this.isPressing = false;
            this.hasMoved = false;
            this.awaitingSecondPress = false;
            if (window._staySecondPressHandler) {
                this.pressBtn.removeEventListener('click', window._staySecondPressHandler);
                window._staySecondPressHandler = null;
            }
            if (resetFill) {
                this.currentFillPercent = 0;
                this.fillProgress.style.width = '0%';
                this.btnTextDiv.style.color = '#2b6ef0';
                this.textSpan.innerHTML = this.lang.press;
                this.textSpan.style.transform = '';
                this.textSpan.style.fontSize = '';
                this.textSpan.style.display = '';
                const loader = this.textSpan.querySelector('.loading-dots');
                if (loader) loader.remove();
                this.pressBtn.style.backgroundColor = 'white';
                this.pressBtn.style.border = '2px solid #2b6ef0';
            }
            if (!keepRetryMessage) {
                this.retryMsgDiv.classList.remove('show');
            }
            if (window._stayFlipTimer) clearTimeout(window._stayFlipTimer);
            if (window._stayLoadingTimer) clearTimeout(window._stayLoadingTimer);
            this._stopAutoDetection();
        }

        _onPointerDown(e) {
            e.preventDefault();
            if (this.fullscreenDiv.classList.contains('show')) return;
            if (this.isVerified) return;
            this._hideStaticTooltip();
            if (window._stayFlipTimer) clearTimeout(window._stayFlipTimer);
            if (window._stayLoadingTimer) clearTimeout(window._stayLoadingTimer);
            if (this.awaitingSecondPress) {
                return;
            }
            this._resetPressState(true, false);
            this.isPressing = true;
            this.hasMoved = false;
            const point = e.touches ? e.touches[0] : e;
            this.startX = point.clientX;
            this.startY = point.clientY;
            this.textSpan.innerHTML = this.lang.pleaseWait;
            this.textSpan.style.fontSize = '';
            this.textSpan.style.transform = '';
            this.textSpan.style.display = '';
            const oldLoader = this.textSpan.querySelector('.loading-dots');
            if (oldLoader) oldLoader.remove();
            this.btnTextDiv.style.color = '#2b6ef0';
            this.pressBtn.style.backgroundColor = 'white';
            this.pressBtn.style.border = '2px solid #2b6ef0';
            this._startFillAnimation();
            window.addEventListener('pointermove', this._onPointerMove.bind(this));
            window.addEventListener('pointerup', this._onPointerUp.bind(this));
            window.addEventListener('touchcancel', this._onPointerUp.bind(this));
        }

        _onPointerMove(e) {
            if (!this.isPressing) return;
            const point = e.touches ? e.touches[0] : e;
            if (Math.abs(point.clientX - this.startX) > 3 || Math.abs(point.clientY - this.startY) > 3) {
                if (!this.hasMoved) this.hasMoved = true;
            }
        }

        _onPointerUp(e) {
            if (!this.isPressing) {
                this._cleanupEvents();
                return;
            }
            if (this.currentFillPercent < 99) {
                this.isPressing = false;
                if (this.stepInterval) clearInterval(this.stepInterval);
                this._resetPressState(true);
                this.retryMsgDiv.classList.add('show');
            } else {
                this.isPressing = false;
            }
            this._cleanupEvents();
        }

        _cleanupEvents() {
            window.removeEventListener('pointermove', this._onPointerMove.bind(this));
            window.removeEventListener('pointerup', this._onPointerUp.bind(this));
            window.removeEventListener('touchcancel', this._onPointerUp.bind(this));
        }

        _startFillAnimation() {
            if (this.stepInterval) clearInterval(this.stepInterval);
            this.currentFillPercent = 0;
            this.fillProgress.style.width = '0%';
            this.startTimestamp = Date.now();
            this.stepInterval = setInterval(() => {
                if (!this.isPressing) return;
                const elapsed = Date.now() - this.startTimestamp;
                let percent = (elapsed / this.REQUIRED_DURATION) * 100;
                if (percent >= 100) {
                    percent = 100;
                    this.fillProgress.style.width = '100%';
                    this.btnTextDiv.style.color = 'white';
                    if (this.stepInterval) clearInterval(this.stepInterval);
                    this.stepInterval = null;
                    if (this.isPressing) {
                        this.isPressing = false;
                        this._onLongPressComplete();
                    }
                    return;
                }
                this.currentFillPercent = percent;
                this.fillProgress.style.width = percent + '%';
                const ratio = Math.min(1, percent / 100);
                const r = 43 + (255 - 43) * ratio;
                const g = 110 + (255 - 110) * ratio;
                const b = 240 + (255 - 240) * ratio;
                this.btnTextDiv.style.color = `rgb(${r}, ${g}, ${b})`;
            }, 30);
        }

        destroy() {
            if (this.rootEl && this.rootEl.parentNode) {
                this.rootEl.parentNode.removeChild(this.rootEl);
            }
            this._resetPressState(true, false);
            if (window._stayFlipTimer) clearTimeout(window._stayFlipTimer);
            if (window._stayLoadingTimer) clearTimeout(window._stayLoadingTimer);
        }
    }

    const STAYcaptcha = {
        instances: [],
        init: function(config) {
            if (!config || !config.container) {
                console.error('[STAYcaptcha] 缺少 container 配置');
                return null;
            }
            const instance = new STAYcaptchaInstance(config);
            this.instances.push(instance);
            return instance;
        },
        destroy: function(container) {
            const idx = this.instances.findIndex(inst => {
                return inst.rootEl && inst.rootEl.parentNode === container;
            });
            if (idx !== -1) {
                this.instances[idx].destroy();
                this.instances.splice(idx, 1);
            }
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = STAYcaptcha;
    } else {
        global.STAYcaptcha = STAYcaptcha;
    }

})(typeof window !== 'undefined' ? window : this);