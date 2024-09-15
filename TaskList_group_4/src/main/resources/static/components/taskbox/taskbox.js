const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css"
href="${import.meta.url.match(/.*\//)[0]}/taskbox.css"/>
<dialog>
<!-- Modal content -->
<span class="close-btn">&times;</span>
<div>
<div>Title:</div>
<div>
<input type="text"  id="task-title" size="25" maxlength="80"
placeholder="Task title" autofocus/>
</div>
<div>Status:</div><div id="task-status"><select id="status-select"></select></div>
</div>
<p><button id="add-task" type="submit">Add task</button></p>
</dialog>
`;

class TaskBox extends HTMLElement {
	
	 
	constructor(){
		super(); 
		
		//Opprette shadow DOM
		this.shadow = this.attachShadow({mode: 'open'});
		
		//Kloner innholdet til shadow DOM
		this.shadow.appendChild(template.content.cloneNode(true));
		console.log(this.shadow.innerHTML);
		
		//Referanser til elementer i modalboksen
		this.dialog = this.shadow.querySelector('dialog');
		this.closeButton = this.shadow.querySelector('.close-btn');
		this.titleInput = this.shadow.querySelector('#task-title');
		this.statusSelector = this.shadow.querySelector('#status-select');
		this.addButton = this.shadow.querySelector("#add-task");
		
		//Event listener for lukkeknapp
		this.closeButton.addEventListener('click', ()=>this.close());
		
		this.taskCallback = null; 
	}
	
	show(){
		this.dialog.showModal(); 	
	}
	
	close(){
		this.dialog.close(); 
	}
	
	
	setStatusesList(statuses){
		
		//Tømmer eksisterende statusvalg
		this.statusSelector.innerHTML= '';
		
		//Legger til nye valg
		statuses.forEach(status => {
			const option = document.createElement('option');
			option.value = status;
			option.textContent = status;
			this.statusSelector.appendChild(option);
		});
		
	}
	
	newTaskCallback(callback){
	
		this.taskCallback = callback; 
		
		this.addButton.addEventListener('click', () => {
			
			const taskTitle = this.titleInput.value; 
			const taskStatus = this.statusSelector.value; 
			
			const newTask = {
				title: taskTitle,
				status: taskStatus,
			};
			this.taskCallback(newTask);
			this.close(); 
		});	
		
		
	}
	
	
}
customElements.define('task-box',TaskBox);