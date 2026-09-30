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

