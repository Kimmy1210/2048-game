class Game2048 {
    constructor() {
        this.grid = Array(16).fill(0);
        this.score = 0;
        this.cells = document.querySelectorAll('.cell');
        this.scoreElement = document.getElementById('score');
        this.touchStartX = null;
        this.touchStartY = null;
        this.mouseStartX = null;
        this.mouseStartY = null;
        this.init();
        this.initTouchEvents();
        this.initMouseEvents();
    }

    init() {
        this.grid = Array(16).fill(0);
        this.score = 0;
        this.addNewNumber();
        this.addNewNumber();
        this.updateDisplay();
    }

    addNewNumber() {
        const emptyCells = this.grid.reduce((acc, curr, idx) => {
            if (curr === 0) acc.push(idx);
            return acc;
        }, []);
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    updateDisplay() {
        this.grid.forEach((value, index) => {
            this.cells[index].textContent = value || '';
            this.cells[index].setAttribute('data-value', value);
        });
        this.scoreElement.textContent = this.score;
    }

    move(direction) {
        let moved = false;
        const oldGrid = [...this.grid];

        switch(direction) {
            case 'ArrowLeft':
                moved = this.moveLeft();
                break;
            case 'ArrowRight':
                moved = this.moveRight();
                break;
            case 'ArrowUp':
                moved = this.moveUp();
                break;
            case 'ArrowDown':
                moved = this.moveDown();
                break;
        }

        if (moved) {
            this.addNewNumber();
            this.updateDisplay();
            
            // 检查是否获胜
            if (this.hasWon()) {
                alert('恭喜你赢了！你获得了2048！');
                if (confirm('要继续游戏吗？')) {
                    this.init();
                }
                return;
            }
            
            // 检查是否游戏结束
            if (this.isGameOver()) {
                alert(`游戏结束！\n你的最终得分是：${this.score}`);
                if (confirm('要重新开始吗？')) {
                    this.init();
                }
            }
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = this.grid.slice(i * 4, (i + 1) * 4);
            const newRow = this.mergeRow(row);
            for (let j = 0; j < 4; j++) {
                if (this.grid[i * 4 + j] !== newRow[j]) {
                    moved = true;
                }
                this.grid[i * 4 + j] = newRow[j];
            }
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = this.grid.slice(i * 4, (i + 1) * 4).reverse();
            const newRow = this.mergeRow(row).reverse();
            for (let j = 0; j < 4; j++) {
                if (this.grid[i * 4 + j] !== newRow[j]) {
                    moved = true;
                }
                this.grid[i * 4 + j] = newRow[j];
            }
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = [
                this.grid[j],
                this.grid[j + 4],
                this.grid[j + 8],
                this.grid[j + 12]
            ];
            const newColumn = this.mergeRow(column);
            for (let i = 0; i < 4; i++) {
                if (this.grid[i * 4 + j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i * 4 + j] = newColumn[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = [
                this.grid[j],
                this.grid[j + 4],
                this.grid[j + 8],
                this.grid[j + 12]
            ].reverse();
            const newColumn = this.mergeRow(column).reverse();
            for (let i = 0; i < 4; i++) {
                if (this.grid[i * 4 + j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i * 4 + j] = newColumn[i];
            }
        }
        return moved;
    }

    mergeRow(row) {
        // 移除零
        let newRow = row.filter(cell => cell !== 0);
        
        // 合并相同的数字
        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                this.score += newRow[i];
                newRow.splice(i + 1, 1);
            }
        }
        
        // 补充零
        while (newRow.length < 4) {
            newRow.push(0);
        }
        
        return newRow;
    }

    isGameOver() {
        // 检查是否有空格
        if (this.grid.includes(0)) return false;
        
        // 检查是否可以合并
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.grid[i * 4 + j];
                if (j < 3 && current === this.grid[i * 4 + j + 1]) return false;
                if (i < 3 && current === this.grid[(i + 1) * 4 + j]) return false;
            }
        }
        return true;
    }

    initTouchEvents() {
        const grid = document.querySelector('.grid');
        
        grid.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        grid.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            
            this.handleSwipe(deltaX, deltaY);
            
            this.touchStartX = null;
            this.touchStartY = null;
        });
    }

    initMouseEvents() {
        const grid = document.querySelector('.grid');
        let isDragging = false;
        
        grid.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.mouseStartX = e.clientX;
            this.mouseStartY = e.clientY;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - this.mouseStartX;
            const deltaY = e.clientY - this.mouseStartY;
            
            // 如果拖动距离足够大，就触发移动
            if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
                this.handleSwipe(deltaX, deltaY);
                isDragging = false;
                this.mouseStartX = null;
                this.mouseStartY = null;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            this.mouseStartX = null;
            this.mouseStartY = null;
        });
    }

    handleSwipe(deltaX, deltaY) {
        const minSwipeDistance = 50; // 最小滑动距离
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.move('ArrowRight');
                } else {
                    this.move('ArrowLeft');
                }
            }
        } else {
            // 垂直滑动
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    this.move('ArrowDown');
                } else {
                    this.move('ArrowUp');
                }
            }
        }
    }

    // 添加获胜判定方法
    hasWon() {
        return this.grid.some(cell => cell >= 2048);
    }
}

// 初始化游戏
const game = new Game2048();

// 添加键盘事件监听
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        game.move(e.key);
    }
});

// 添加新游戏按钮事件
document.getElementById('newGame').addEventListener('click', () => {
    game.init();
}); 