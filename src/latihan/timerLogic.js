import { gameOver } from './gameLogic.js';
import { getDifficultySettings } from './targetLogic.js';

export function updateTimer(delta, game) {
    // TODO (versi siswa): hitung waktu dan akhiri ronde saat waktu habis.
    // Petunjuk: akumulasi delta, gunakan ceil untuk HUD, dan panggil gameOver(game).

    if (game.state !== 'PLAYING') return;
    game.gameElapsed += delta;

    const nextTime = Math.max(0, Math.ceil(game.selectedTime - game.gameElapsed));
    if (nextTime !== game.timeLeft) game.timeLeft = nextTime;

    if (game.combo > 0) {
        game.comboTimer -= delta;
        if (game.comboTimer <= 0) game.updateCombo(false);
    }

    if (game.feedbackTimer > 0) {
        game.feedbackTimer -= delta;
        if (game.feedbackTimer <= 0) {
            const settings = getDifficultySettings(game);
            game.status = `NEED ${settings.minPunchSpeed.toFixed(1)}   PERFECT ${settings.perfectSpeed.toFixed(1)}`;
        }
    }

    if (game.gameElapsed >= game.selectedTime) {
        game.timeLeft = 0;
        gameOver(game);
    }
}
