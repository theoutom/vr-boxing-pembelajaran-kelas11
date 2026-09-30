import * as THREE from 'three';
import { getDifficultySettings } from './targetLogic.js';

const SPEED_WINDOW = 0.12;
const HAND_IGNORE_SPEED = 0.55;
const PUNCH_COOLDOWN = 0.20;
const SCORE_INTERVAL_MS = 200;
const HIT_RADIUS = 0.50 * 0.48 + 0.12;

export function detectPunch(controller, hand, delta, game) {
    // TODO (versi siswa): deteksi pukulan dari kecepatan tangan controller.
    // Petunjuk: bandingkan posisi saat ini dengan sampel sebelumnya, lalu panggil checkHit.
    if (game.state !== 'PLAYING') return false;
    const previousPosition = hand === 'left'
        ? game.controllers.previousLeftPosition
        : game.controllers.previousRightPosition;
    const samples = hand === 'left' ? game.leftMotionSamples :
        game.rightMotionSamples;
    const motion = sampleHandMotion(controller, previousPosition, samples,
        delta);
    const speed = Math.max(motion.instantSpeed, motion.windowSpeed);
    const armedKey = hand === 'left' ? 'leftHitArmed' : 'rightHitArmed';

    // Serangan (hit) hanya dapat mencetak skor satu kali jika tangan pemukul sudah menjauh dari target.
    if (game[armedKey] === false) {
        if (motion.to.distanceTo(game.target.position) > 0.55 && speed <
            HAND_IGNORE_SPEED) {
            game[armedKey] = true;
        } else {
            return false;
        }
    }
    if (hand === 'left') game.leftHandSpeed = motion.windowSpeed;
    else game.rightHandSpeed = motion.windowSpeed;
    const cooldownKey = hand === 'left' ? 'leftPunchCooldown' :
        'rightPunchCooldown';
    if (game[cooldownKey] > 0) {
        game[cooldownKey] = Math.max(0, game[cooldownKey] - delta);
        return false;
    }
    if (speed < HAND_IGNORE_SPEED) return false;
    const settings = getDifficultySettings(game);
    if (speed < settings.minPunchSpeed) {
        game.status = `TOO SLOW ${speed.toFixed(1)} m/s`;
        game.feedbackTimer = 0.9;
        game[cooldownKey] = PUNCH_COOLDOWN;
        return false;
    }
    const hit = checkHit(controller, game, motion, speed, hand);
    if (hit) game[cooldownKey] = PUNCH_COOLDOWN;
    return hit;

}


export function checkHit(controller, game, motion = game.latestMotion, speed = game.latestPunchSpeed, hand = game.latestPunchHand) {
    // TODO (versi siswa): bandingkan lintasan controller dengan target/hitbox.
    // Petunjuk: ukur jarak titik ke segmen, lalu perbarui hit/miss, score, combo, dan audio.
    if (!motion || !Number.isFinite(speed)) return false;
    game.latestMotion = motion;
    game.latestPunchSpeed = speed;
    game.latestPunchHand = hand;
    const box = game.getTargetHitbox();
    const hitPoint = !box.isEmpty() &&
        (box.containsPoint(motion.from) || box.containsPoint(motion.to));
    const segmentDistance = distancePointToSegment(game.target.position,
        motion.from, motion.to);
    const isHit = hitPoint || segmentDistance <= HIT_RADIUS;
    const closestDistance = Math.min(
        motion.from.distanceTo(game.target.position),
        motion.to.distanceTo(game.target.position),
    );

    // Bagian B [JIKA HIT]
    if (isHit) {
        const armedKey = hand === 'left' ? 'leftHitArmed' : 'rightHitArmed';
        if (game[armedKey] === false) return false;
        game[armedKey] = false;
        const now = performance.now();
        if (now - (game.lastScoredAt ?? -Infinity) < SCORE_INTERVAL_MS) {
            game[hand === 'left' ? 'leftPunchCooldown' : 'rightPunchCooldown'] =
                PUNCH_COOLDOWN;
            return false;
        }
        game.lastScoredAt = now;
        const settings = getDifficultySettings(game);
        const isPerfect = speed >= settings.perfectSpeed && closestDistance <=
            0.13;
        game.hits += 1;
        if (isPerfect) game.perfects += 1;
        game.updateCombo(true);
        // Satu pukulan selalu memberi satu poin; combo hanya penghitung pukulan beruntun.
        const points = 1;
        game.addScore(points);
        game.target.material.color.setHex(isPerfect ? 0x66ff66 : 0xffff00);
        game.target.scale.setScalar(1.08);
        const fist = hand === 'left' ? game.controllers.leftFist :
            game.controllers.rightFist;
        fist.scale.setScalar(1.30);
        game.audio.play(isPerfect ? 'perfect' : 'hit', isPerfect ? 0.80 : 0.65);
        game.status = isPerfect ? `PERFECT +${points}` : `HIT +${points}`;
        game.feedbackTimer = 0.9;
        return true;
    }

    // Bagian C [JIKA MISS]
    if (!isTargetedSwing(motion, game)) return false;
    game.misses += 1;
    game.updateCombo(false);
    game[hand === 'left' ? 'leftPunchCooldown' : 'rightPunchCooldown'] =
        PUNCH_COOLDOWN;
    game.audio.play('miss', 0.45);
    game.status = `MISS ${speed.toFixed(1)} m/s`;
    game.feedbackTimer = 0.9;
    return false;
}

function sampleHandMotion(controller, previousPosition, samples, delta) {
    // TODO (versi siswa): simpan posisi controller dan hitung kecepatan.
    // Petunjuk: jarak dibagi delta menghasilkan kecepatan; jendela waktu mengurangi noise.
}

function isTargetedSwing(motion, game) {
    // TODO (versi siswa): bedakan ayunan yang menuju target dari gerakan lain.
    // Petunjuk: gunakan dot product arah ayunan dan arah target.

}

function distancePointToSegment(point, start, end) {
    // TODO (versi siswa): cari jarak minimum titik terhadap garis segmen.
    // Petunjuk: proyeksikan vektor ke segmen dan batasi parameter t ke 0..1.
}

