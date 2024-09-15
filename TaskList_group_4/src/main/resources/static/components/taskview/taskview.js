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

import '../tasklist/tasklist.js';
import '../taskbox/taskbox.js';

class TaskView extends HTMLElement {
	
	constructor(){
		super();
		
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(template.content.cloneNode(true));
		
		this.tasklist = this.shadowRoot.querySelector('task-list');
		this.taskbox = this.shadowRoot.querySelector('task-box'); 
		this.messageElement = this.shadowRoot.querySelector('#message');
		this.newTaskButton = this.shadowRoot.querySelector('button');
		
		this.serviceUrl = this.getAttribute('data-serviceurl');
		
		this.initialize()
		
		
		
	}
	
	async initialize(){
		this.messageElement.textContent = "Loading tasks...";
		
		//Henter alle statuser og setter dem inn i taskbox og tasklist
		const statuses = await this.fetchAllStatuses();
		if(statuses){
			this.taskbox.setStatusesList(statuses);
			this.tasklist.setStatuseslist(statuses);
			console.log(this.newTaskButton);
			this.newTaskButton.disabled = false; 
		}
		
		//Henter oppgaver og viser dem i tasklist
		const tasks = await this.fetchAllTasks();
		if(tasks){
			this.messageElement.textContent = "";
			tasks.forEach(task => this.tasklist.showTask(task));
		}
		
		//Setter opp callback for å håndtere nye oppgaver via taskbox
		this.taskbox.newTaskCallback(async (newTask) => {
			const addedTask = await this.createTask(newTask.title, newTask.status);
			if(addedTask){
				this.tasklist.showTask(addedTask);
			}
		});
		
		//Setter opp callback for statusendringer
		this.tasklist.changestatusCallback(async (id, newStatus) => {
			const updatedTask = await this.updateStatus(id, newStatus);
			if(updatedTask){
				this.tasklist.updateTask(updatedTask);
			}
		});
		
		//Setter opp callback for sletting av oppgaver'
		this.tasklist.deletetaskCallback(async id => {
			const deletedTask = await this.deleteTask(id);
			if(deletedTask && deletedTask.responseStatus){
				this.tasklist.removeTask(id);
				
			}else {
				console.error(`Oppgaven med ID ${id} ble ikke slettet fra serveren.`);
			}
		});
		
		//Viser taskbox modal ved knappetrykk
		this.newTaskButton.addEventListener('click', () => {
			this.taskbox.show();
		});
		
	}
	
	//Henter alle statuser fra database
	async fetchAllStatuses(){
	
		try{
			const response = await fetch(`${this.serviceUrl}/allstatuses`); 
			const data = await response.json();
			if(data.responseStatus){
				return data.allstatuses;
			}
			
			}catch(error){
				console.error("Feil ved henting av statuser", error);
			
		}
			
	}
	
	//Henter alle oppgaver fra database
	async fetchAllTasks(){
		
		try{
			const response = await fetch(`${this.serviceUrl}/tasklist`);
			const data = await response.json(); 
			if(data.responseStatus){
				return data.tasks;
			}
		}catch (error) {
         	console.error('Feil ved henting av oppgaver:', error);
		}
	
	}
	
	//Oppretter ny oppgave	
	async createTask(title, status){
		try{
			const response = await fetch(`${this.serviceUrl}/tasklist`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({title, status})
			});
			
			const data = await response.json();
			if(data.responseStatus){
				return data.task;
			}
		}catch(error){
			console.error('Feil ved oppretting av oppgave:', error);
		}
	}
	
	//Oppdaterer status til en oppgave
	async updateStatus(id, newStatus){
		try{
			const response = await fetch(`${this.serviceUrl}/task/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});
			const data = await response.json(); 
			if(data.responseStatus){
				return data;
			}
		}catch(error){
			console.error('Feil ved oppdatering av status', error);
		}
	}
	
	//Sletter oppgave 
	async deleteTask(id){
		try{
			const response = await fetch(`${this.serviceUrl}/task/${id}`,{
				method: 'DELETE'
			});
			
			const data = await response.json(); 
			if(data.responseStatus){
				this.tasklist.removeTask(id);
				return data; 
			}
			
		}catch(error){
			console.error('Feil ved sletting av oppgave', error);
		}
	}	
		
}

customElements.define('task-view',TaskView);