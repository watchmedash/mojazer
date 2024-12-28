(() => {
    class VirtualJoystick {
        constructor() {
            this.isDragging = false;
            this.baseX = 120; // Joystick base X position
            this.baseY = Graphics.height - 120; // Joystick base Y position
            this.maxDistance = 50; // Maximum joystick movement radius
            this.createJoystick();
        }

        createJoystick() {
            // Load the joystick image
            this.joystick = new Sprite(ImageManager.loadPicture("joystick"));
            this.joystick.anchor.set(0.5); // Center the joystick image
            this.joystick.x = this.baseX;
            this.joystick.y = this.baseY;
            SceneManager._scene.addChild(this.joystick);

            // Add touch listeners
            this.initTouchListeners();
        }

        initTouchListeners() {
            const canvas = document.querySelector("canvas");

            // Attach touch listeners to the canvas
            canvas.addEventListener("touchstart", this.onTouchStart.bind(this), { passive: false });
            canvas.addEventListener("touchmove", this.onTouchMove.bind(this), { passive: false });
            canvas.addEventListener("touchend", this.onTouchEnd.bind(this), { passive: false });
        }

        onTouchStart(event) {
            event.preventDefault(); // Prevent default touch behavior
            const touch = event.touches[0];
            if (this.isInsideJoystick(touch.clientX, touch.clientY)) {
                this.isDragging = true;
            }
        }

        onTouchMove(event) {
            if (!this.isDragging) return;

            event.preventDefault(); // Prevent default touch behavior
            const touch = event.touches[0];
            const dx = touch.clientX - this.baseX;
            const dy = touch.clientY - this.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const limitedDistance = Math.min(distance, this.maxDistance);

            const angle = Math.atan2(dy, dx);

            this.joystick.x = this.baseX + Math.cos(angle) * limitedDistance;
            this.joystick.y = this.baseY + Math.sin(angle) * limitedDistance;

            this.movePlayer(angle);
        }

        onTouchEnd(event) {
            event.preventDefault(); // Prevent default touch behavior
            this.isDragging = false;

            // Reset joystick to center
            this.joystick.x = this.baseX;
            this.joystick.y = this.baseY;
        }

        isInsideJoystick(x, y) {
            const dx = x - this.baseX;
            const dy = y - this.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= this.maxDistance; // Adjust radius based on your image size
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
