import {completeAssign} from 'common/utils';
import SceneObject from 'graphics/scene-object';

import remove from 'lodash.remove';

export function SceneModel(options) {
	return Object.assign({
		backgroundColor: 'rgba(0, 0, 0, 0)',
		children:[]
	}, options);
}

export function SceneController({children}) {
	return {
		add(child) {
			remove(children, child);
			children.push(child);
			children.sort((a, b) => a.zIndex - b.zIndex);
			if (child.scene() !== this) {
				child.setScene(this);
			}
			return this;
		},
		remove(child) {
			remove(children, child);
			child.scene = null;
			return this;
		}
	};
}

export function SceneView(coordinates, state) {
	return SceneObject(coordinates, Object.assign({
		onRender(screen, scene, rect) {
			screen.brush = state.backgroundColor;
			screen.fillRect(rect);
			for (let child of state.children) {
				child.render(screen);
			}
		}
	}, state));
}

export default (coordinates, options) => {
	const state = SceneModel(options);
	return completeAssign(
		{},
		SceneView(coordinates, state),
		SceneController(state)
	);
}
