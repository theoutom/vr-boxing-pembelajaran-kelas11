export function getDifficultySettings(game) {
    // TODO (versi siswa): pindahkan konfigurasi difficulty ke tabel agar mudah dibaca.
    // Petunjuk: EASY, NORMAL, HARD mengatur kecepatan pukulan dan orbit target.
    const presets = {
        EASY: { minPunchSpeed: 0.85, perfectSpeed: 1.70, orbitMin: 0.90, orbitMax: 1.25, directionChangeMin: 1.5, directionChangeMax: 2.8 },
        NORMAL: { minPunchSpeed: 1.20, perfectSpeed: 2.30, orbitMin: 1.30, orbitMax: 1.75, directionChangeMin: 1.0, directionChangeMax: 2.0 },
        HARD: { minPunchSpeed: 1.65, perfectSpeed: 2.80, orbitMin: 1.75, orbitMax: 2.45, directionChangeMin: 0.70, directionChangeMax: 1.45 }
    };
    return presets[game.difficulty] || presets.NORMAL;
}

export function moveTarget(delta, game) {
    // TODO (versi siswa): gerakkan target mengelilingi pemain dengan delta time.
    // Petunjuk: ubah sudut berdasarkan speed dan arah; gunakan sin/cos untuk X/Z.

    if (game.orbitChangeDuration <= 0 || game.orbitChangeTimer >=
        game.orbitChangeDuration) {
        const settings = getDifficultySettings(game);
        game.desiredOrbitDirection = Math.random() < 0.5 ? 1 : -1;
        game.desiredOrbitSpeed = randomBetween(settings.orbitMin,
            settings.orbitMax);
        game.orbitChangeDuration = randomBetween(settings.directionChangeMin,
            settings.directionChangeMax);
        game.orbitChangeTimer = 0;
    }
    game.orbitChangeTimer += delta;
    game.orbitDirection = damp(game.orbitDirection, game.desiredOrbitDirection,
        8, delta);
    game.orbitSpeed = damp(game.orbitSpeed, game.desiredOrbitSpeed, 5, delta);
    game.targetAngle += game.orbitDirection * game.orbitSpeed * delta;
    const x = game.playerAnchor.x + Math.sin(game.targetAngle) *
        game.targetRadius;
    const z = game.playerAnchor.z - Math.cos(game.targetAngle) *
        game.targetRadius;
    game.target.position.set(x, game.playerAnchor.y, z);
    game.target.lookAt(game.playerAnchor);

}

function damp(current, target, smoothing, delta) {
    // TODO (versi siswa): haluskan perubahan nilai tanpa bergantung pada FPS.
    // Petunjuk: faktor peredam dapat dihitung dengan eksponen dan delta time.
    const amount = 1 - Math.exp(-smoothing * delta);
    return current + (target - current) * amount;
}

function randomBetween(min, max) {
    // TODO (versi siswa): ambil angka acak dalam rentang yang diberikan.
    // Petunjuk: min + Math.random() dikali selisih max dan min.
    return min + Math.random() * (max - min);
}
