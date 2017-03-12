import Coordinates from 'graphics/coordinates';
import Scene from 'graphics/scene';

import GraphicsView from 'ui/graphics-view';

import Vector from 'maths/vector';

const columns = 28;
const rows = 31;

export default function GameView({model}) {
	const scene = Scene(Coordinates({
		width: columns,
		height: rows
	}, Vector.Null));
	const graphics_view = GraphicsView({
		id: 'screen',
		onBeforeRender(screen) {
			const size = model.size();
			scene.setScale(Math.round(size.width/columns));
			screen.reset()
				.setBackgroundColor('#123')
				.setSize(size)
				.add(scene);
		},
		model,
		modelEventFilter(event_name, attribute) {
			return event_name === 'changed' && attribute === 'size';
		}
	});
	return Object.assign(graphics_view, {
		scene() {
			return scene;
		}
	});
}