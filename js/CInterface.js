function CInterface() {
    var _oAudioToggle, _oButExit, _oContainer, _oButFullscreen, _oHelpPanel = null;
    var _bMobileInitialized, _fRequestFullScreen = null, _fCancelFullScreen = null;
    var _pStartPosExit, _pStartPosAudio, _pStartPosFullscreen;
    var _oButUpP1, _oButDownP1, _oButUpP2, _oButDownP2;
    var _pStartPosButUpP1, _pStartPosButDownP1, _pStartPosButUpP2, _pStartPosButDownP2;
    var _oScoreTextBlue, _oScoreTextRed, _pStartPosDice, _oButDice;
    var _oTurnP1, _oTurnP2, _oLightTurn, _bFirstTurn;
    var _oPlayer1Text = null, _oPlayer2Text = null;
    var _oParent = this;

    this._init = function() {
        _bFirstTurn = true;
        _oContainer = new createjs.Container();
        _bMobileInitialized = false;
        s_oStage.addChild(_oContainer);

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = { x: CANVAS_WIDTH - (oSprite.width / 2) - 10, y: (oSprite.height / 2) + 10 };
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, _oContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        _pStartPosAudio = { x: _pStartPosExit.x - (oSprite.width) - 5, y: (oSprite.height / 2) + 10 };

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, _oContainer);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }

        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (ENABLE_FULLSCREEN === false) _fRequestFullScreen = false;

        if (_fRequestFullScreen && screenfull.isEnabled) {
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen");
            _pStartPosFullscreen = { x: oSprite.width / 4 + 10, y: oSprite.height / 2 + 10 };
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSprite, s_bFullscreen, _oContainer);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreen, this);
        }

        oSprite = s_oSpriteLibrary.getSprite("light_turn");
        _oLightTurn = createBitmap(oSprite, oSprite.width, oSprite.height);
        _oLightTurn.regX = 11;
        _oLightTurn.regY = 12;
        _oLightTurn.x = X_INTERFACE_PLAYER + 3;
        _oLightTurn.y = Y_INTERFACE_PLAYER_1;
        _oLightTurn.alpha = 0;
        _oContainer.addChild(_oLightTurn);

        oSprite = s_oSpriteLibrary.getSprite("turn_p1");
        _oTurnP1 = createBitmap(oSprite, oSprite.width, oSprite.height);
        _oTurnP1.x = X_INTERFACE_PLAYER;
        _oTurnP1.y = Y_INTERFACE_PLAYER_1;
        _oContainer.addChild(_oTurnP1);

        oSprite = s_b2Players ? s_oSpriteLibrary.getSprite("turn_p2") : s_oSpriteLibrary.getSprite("turn_cpu");
        _oTurnP2 = createBitmap(oSprite, oSprite.width, oSprite.height);
        _oTurnP2.x = X_INTERFACE_PLAYER;
        _oTurnP2.y = Y_INTERFACE_PLAYER_2;
        _oContainer.addChild(_oTurnP2);

        _pStartPosDice = { x: CANVAS_WIDTH - 200, y: CANVAS_HEIGHT / 2 };
        oSprite = s_oSpriteLibrary.getSprite("but_dice");
        _oButDice = new CGfxButton(CANVAS_WIDTH + 200, _pStartPosDice.y, oSprite, _oContainer);
        _oButDice.addEventListener(ON_MOUSE_UP, this._onRollDice, this);
        _oButDice.pulseAnimation();

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.unload = function() {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        _oButExit.unload();
        s_oStage.removeChild(_oContainer);
        if (_fRequestFullScreen && screenfull.isEnabled) _oButFullscreen.unload();
        s_oInterface = null;
    };

    this.refreshPlayersScore = function(iScoreP1, iScoreP2) {
        _oScoreTextBlue.text = iScoreP1;
        _oScoreTextRed.text = iScoreP2;
    };

    this.setPlayer1 = function(name) {
        if (_oPlayer1Text) _oPlayer1Text.unload();
        var oSprite = s_oSpriteLibrary.getSprite("turn_p1");
        var iYOffset = 5;
        var iX = _oTurnP1.x + oSprite.width / 2;
        var iY = _oTurnP1.y + oSprite.height + iYOffset;
        _oPlayer1Text = new CVerticalText(iX, iY, name, _oContainer);
        var scale = _oPlayer1Text.getCurScale();
        _oPlayer1Text.setScale(scale);
        if (name.length <= 3) _oPlayer1Text.center();
    };

    this.setPlayer2 = function(name) {
        if (_oPlayer2Text) _oPlayer2Text.unload();
        var oSprite = s_oSpriteLibrary.getSprite("turn_p1");
        var iYOffset = 5;
        var iX = _oTurnP2.x + oSprite.width / 2;
        var iY = _oTurnP2.y + oSprite.height + iYOffset;
        _oPlayer2Text = new CVerticalText(iX, iY, name, _oContainer);
        var scale = _oPlayer2Text.getCurScale();
        _oPlayer2Text.setScale(scale);
        if (name.length <= 3) _oPlayer2Text.center();
    };

    this.onFocusTurn = function(bTurnPlayer1) {
        if (_bFirstTurn) {
            _bFirstTurn = false;
            _oParent.tweenFocusTurn();
        }
        _oLightTurn.y = bTurnPlayer1 ? Y_INTERFACE_PLAYER_1 : Y_INTERFACE_PLAYER_2;
    };

    this.tweenFocusTurn = function() {
        new createjs.Tween.get(_oLightTurn).to({ alpha: 1 }, 700).to({ alpha: 0 }, 700).call(_oParent.tweenFocusTurn);
    };

    this.setOnTop = function() {
        s_oStage.addChildAt(_oContainer, s_oStage.numChildren);
    };

    this.setVisibleButDice = function(bVal) {
        if (!bVal) {
            _oButDice.setClickable(false);
            new createjs.Tween.get(_oButDice.getButtonImage()).to({ x: CANVAS_WIDTH + 200 }, 300, createjs.Ease.cubicIn);
        } else {
            _oButDice.setClickable(true);
            new createjs.Tween.get(_oButDice.getButtonImage()).to({ x: _pStartPosDice.x }, 300, createjs.Ease.cubicOut);
        }
    };

    this._onRollDice = function() { s_oGame.rollDice(); };
    this._onAudioToggle = function() { Howler.mute(s_bAudioActive); s_bAudioActive = !s_bAudioActive; };
    this._onExit = function() { new CAreYouSurePanel(TEXT_ARE_SURE, s_oGame.onConfirmExit); };
    this.resetFullscreenBut = function() { if (_fRequestFullScreen && screenfull.isEnabled) _oButFullscreen.setActive(s_bFullscreen); };
    this._onFullscreen
