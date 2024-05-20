// Copyright (c) 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const audioContext = new AudioContext();
let mediaStream = null;
let volumeMeterNode = null;
let isPlaying = false;
let isModuleLoaded = false;

const startAudio = async (context, meterElement) => {
  if (!isModuleLoaded) {
    await context.audioWorklet.addModule('volume-meter-processor.js');
    mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
    const micNode = context.createMediaStreamSource(mediaStream);
    volumeMeterNode = new AudioWorkletNode(context, 'volume-meter');
    volumeMeterNode.port.onmessage = ({data}) => {
      meterElement.value = data * 500;
    };
    micNode.connect(volumeMeterNode).connect(context.destination);
    isModuleLoaded = true;
  } else audioContext.resume();
};
// A simple onLoad handler. It also handles user gesture to unlock the audio
// playback.
window.addEventListener('load', async () => {
  const buttonEl = document.getElementById('button-start');
  const meterEl = document.getElementById('volume-meter');
  buttonEl.disabled = false;
  meterEl.disabled = false;
  buttonEl.addEventListener('click', async () => {
    if (!isPlaying) { // If audio is not playing, start audio
      await startAudio(audioContext, meterEl);
      buttonEl.textContent = 'STOP';
      isPlaying = true;
    } else { // If audio is playing, stop audio
      audioContext.suspend();
      buttonEl.textContent = 'START';
      isPlaying = false;
    }
  }, false);
});
