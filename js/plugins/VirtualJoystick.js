(() => {
    class VirtualJoystick {
        constructor() {
            this.isDragging = false;
            this.createJoystick();
        }

        createJoystick() {
            // Load the joystick graphic
            this.joystick = new Sprite(ImageManager.loadPicture("joystick"));
            this.joystick.anchor.set(0.5); // Center the sprite
            this.joystick.x = 150; // Starting X position (adjust as needed)
            this.joystick.y = Graphics.height - 80; // Starting Y position (adjust as needed)
            SceneManager._scene.addChild(this.joystick);

            // Add touch listeners
            this.initTouchListeners();
        }

        initTouchListeners() {
            const canvas = document.querySelector("canvas");

            canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
            canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
            canvas.addEventListener("touchend", this.onTouchEnd.bind(this));
        }

        onTouchStart(event) {
            const touch = event.touches[0];
            if (this.isInsideJoystick(touch.clientX, touch.clientY)) {
                this.isDragging = true;
            }
        }

        onTouchMove(event) {
            if (!this.isDragging) return;

            const touch = event.touches[0];
            const dx = touch.clientX - this.joystick.x;
            const dy = touch.clientY - this.joystick.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 50; // Adjust radius as needed

            const angle = Math.atan2(dy, dx);
            const limitedDistance = Math.min(distance, maxDistance);

            this.joystick.x = 100 + Math.cos(angle) * limitedDistance; // Base position + limited movement
            this.joystick.y = Graphics.height - 150 + Math.sin(angle) * limitedDistance;

            this.movePlayer(angle);
        }

        onTouchEnd() {
            this.isDragging = false;
            // Reset joystick to the center
            this.joystick.x = 100;
            this.joystick.y = Graphics.height - 150;
        }

        isInsideJoystick(x, y) {
            const dx = x - this.joystick.x;
            const dy = y - this.joystick.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= 50; // Adjust radius based on joystick size
        }

        movePlayer(angle) {
            const direction = this.getDirectionFromAngle(angle);
            if (direction) {
                const event = new KeyboardEvent("keydown", { keyCode: direction });
                document.dispatchEvent(event);
            }
        }

        getDirectionFromAngle(angle) {
            if (angle >= -Math.PI / 4 && angle < Math.PI / 4) return 39; // Right arrow key
            if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) return 40; // Down arrow key
            if (angle >= -(3 * Math.PI) / 4 && angle < -Math.PI / 4) return 38; // Up arrow key
            return 37; // Left arrow key
        }
    }

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _Scene_Map_start.call(this);
        this.virtualJoystick = new VirtualJoystick();
    };
})();
