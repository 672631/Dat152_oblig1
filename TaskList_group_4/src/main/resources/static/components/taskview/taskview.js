const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css"
href="${import.meta.url.match(/.*\//)[0]}/taskview.css"/>
<h1>Tasks</h1>
<div id="message"><p>Waiting for server data.</p></div>
<div id="newtask">
<button type="button" disabled>New task</button>
</div>
<!-- The task list -->
<task-list></task-list>
<!-- The Modal -->
<task-box></task-box>
`;

import './tasklist/tasklist.js';
import './taskbox/taskbox.js';

class TaskView extends HTMLElement {
	
	constructor(){
		super();
		
		this.shadow = this.attachSadow({mode: 'open'});
		
		this.shadow.appendChild(template.content.cloneNode(true)); 
		
		
		
	}
}

customElements.define('task-view',TaskView);