import {
	createSequencer,
	createSynth,
	createMixer,
} from 'sound';

import is_nil from 'lodash.isnil';
import cond from 'lodash.cond';
import no_op from 'lodash.noop';
import create_controls from 'sound/controls';
import ui from 'sound/controls/ui';
import {	default as keyboard } from 'ui/keyboard';

const view_factory = create_controls();
const views = [];

const synth_patch = {
	nodes: [{
			id: 'generator',
			factory: 'mono',
			type: 'voice',
			config: {
				type: {
					value: 'square'
				}
			}
		},
		{
			id: 'enveloppe',
			factory: 'enveloppe'
		},
		{
			id: 'filter',
			factory: 'filter',
			type: 'output',
			config:{
				frequency:{
					value: .95,
					views: [{
						factory: 'knob'
					}]
				},
				Q: {
					value: 0,
					views: [{
						factory: 'knob'
					}]
				},
				gain: {
					value: .95
				},
				type: {
					value: 'lowpass'
				}
			},
		},
		{
			id: 'lfo',
			factory: 'lfo',
			config: {
				frequency: {
					value: .125
				},
				amplitude: {
					value: 0.9
				},
				type: {
					value: 'sine'
				}
			}
		},
	],
	connexions: [
		['generator', 'filter'],
		['lfo', 'filter']
	]

};



const introduction_partition = [
	[{
			note: 'A',
			octave: 2,
			duration: 'QUARTER'
		}, {}, {}, {
			note: 'A',
			octave: 2,
			duration: 'QUARTER'
		}, {}, {}, {
			note: 'A',
			octave: 2,
			duration: 'EIGHTH'
		}, {}, {}, {}, {
			note: 'A',
			octave: 2,
			duration: 'QUARTER'
		}, {},
		{
			note: 'A',
			octave: 2,
			duration: 'WHOLE'
		}, {}, {
			note: 'D',
			octave: 2,
			duration: 'QUARTER'
		}, {}
	],
	[{
			note: 'B',
			octave: 2,
			duration: 'EIGHTH'
		}, {}, {}, {},
		{}, {}, {}, {},
		{}, {}, {}, {},
		{}, {}, {}, {}
	]
];


const audio_context = new AudioContext();

const seq = createSequencer({
	audio_context
});
const synth = createSynth({
	audio_context
});
const mixer = createMixer({
	audio_context
});

synth.patch(synth_patch);
seq.assign('track_1', synth);
seq.tracks['track_1'].partition = introduction_partition;

mixer.assign('1', synth);
mixer.connect({
	input: audio_context.destination
});
mixer.tracks['1'].gain.value = 1;

ui.bind_events({
	keypress: {
		code: keyboard.KEY_SPACE,
		event: 'play',
		keyup: cond([[seq.isStarted, seq.stop], [()=> true, seq.start]]),
		keydown: no_op
	}
});

// seq.start();

function mount_synth(element){
	const controls = element.querySelectorAll('[data-control]');
	for(let control of controls){
		let view_name = control.getAttribute('data-control');
		let path = control.getAttribute('data-param');
		if(is_nil(path)){
			continue;
		}
		path = path.split('.');
		const node = synth.nodes[path[0]];
		const param = node[path[1]];
		const view = view_factory.bindParameter({
			factory: view_name,
			options: {
				element: control
			}
		}, param);
		views.push(view);
	}
}

function mount_sequencer(element){
	const controls = element.querySelectorAll('[data-control]');
	for(let control of controls){
		let view_name = control.getAttribute('data-control');
		let path = control.getAttribute('data-param');
		if(is_nil(path)){
			continue;
		}
		const param = seq[path];
		const view = view_factory.bindParameter({
			factory: view_name,
			options: {
				element: control
			}
		}, param);
		views.push(view);
	}
}

const synthElement = document.querySelector('[data-device="synth"]');
const seqElement = document.querySelector('[data-device="seq"]');
mount_synth(synthElement);
mount_sequencer(seqElement);

function loop() {
	views.forEach(view => view.render());
	seq.play();
	requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
