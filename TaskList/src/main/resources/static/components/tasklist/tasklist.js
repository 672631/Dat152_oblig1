const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/tasklist.css"/>

    <div id="tasklist"></div>`;

const tasktable = document.createElement("template");
tasktable.innerHTML = `
    <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

const taskrow = document.createElement("template");
taskrow.innerHTML = `
    <tr>
        <td></td>
        <td></td>
        <td>
            <select>
                <option value="0" selected>&lt;Modify&gt;</option>
            </select>
        </td>
        <td><button type="button">Remove</button></td>
    </tr>`;

/**
  * TaskList
  * Manage view with list of tasks
  */
class TaskList extends HTMLElement {

    constructor() {
        super();
		
        /**
         * Fill inn rest of the code
         */
		this.shadow = this.attachShadow({mode: 'open'});
		this.shadow.appendChild(template.content.cloneNode(true));
		
		this.taskListElement = this.shadow.querySelector('#tasklist');
		this.taskListElement.appendChild(tasktable.content.cloneNode(true));
		
		
		
		this.tasks = [];
		this.statuses = [];
		this.changeCallback = null;
		this.deleteCallback = null;
		
		
		
		
		// Dynamisk delegasjon for statusendring (select)
		        this.shadow.addEventListener('change', (event) => {
		            if (event.target.tagName === 'SELECT') {
		                const selectElement = event.target;
		                const row = selectElement.closest('tr');
		                const taskId = row.querySelector('td:nth-child(1)').textContent;  // Anta ID-en er i første kolonne
		                const newStatus = selectElement.value;
		                
		                // Bekreft og kjør statusendrings-callback hvis tilgjengelig
		                const confirmation = window.confirm(`Set '${taskId}' to ${newStatus}?`);
		                if (confirmation && this.changeCallback) {
		                    this.changeCallback(taskId, newStatus);
		                }
		            }
		        });
				
				// Dynamisk delegasjon for sletting av oppgaver (button)
				       this.shadow.addEventListener('click', (event) => {
				           if (event.target.tagName === 'BUTTON' && event.target.textContent === 'Remove') {
				               const row = event.target.closest('tr');
				               const taskId = row.querySelector('td:nth-child(1)').textContent;  // Anta ID-en er i første kolonne

				               // Bekreft og kjør slettings-callback hvis tilgjengelig
				               const confirmation = window.confirm(`Are you sure you want to delete task ${taskId}?`);
				               if (confirmation && this.deleteCallback) {
				                   this.deleteCallback(taskId);
				               }
				           }
				       });
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {
       
		console.log("Statuses list:", allstatuses);
		
		//Lagre statusene for senere bruk
		this.statuses = allstatuses; 
		
		//Finner alle <select> elementer i tabellen
		const selectElements = this.shadow.querySelectorAll('select');
		
		//Oppdaterer hvert <select> element med de nye statusene
		selectElements.forEach(select => {
			
			//Fjerner eksisterende alternativer
			select.innerHTML = ''; 
			
			//Legger til standard <Modify>-valg
			const modifyOption = document.createElement('option');
			modifyOption.value = 0; 
			modifyOption.textContent = "<Modify>";
			select.appendChild(modifyOption);
			
			//Legger til hver status som et nytt <option>-element
			allstatuses.forEach(status =>{
				const option = document.createElement('option');
				option.value = status; 
				option.textContent = status; 
				select.appendChild(option);
			});
			
		});
    }

    /**
     * Add callback to run on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    changestatusCallback(callback) {
    	this.changeCallback = callback;
		/*
		//Finn alle <select> elementer og legg til en event listener for "change" hendelse
		const selectElements = this.shadow.querySelectorAll('select');
		if (selectElements.length === 0) {
		    console.error("Ingen <select>-elementer funnet. Sørg for at oppgavene er lagt til før du kaller changestatusCallback.");
		    return;
		}
		
		selectElements.forEach((select, index) => {
			select.addEventListener('change', (event) => {
				const newStatus = event.target.value;
				
				// Henter ID for den tilhørende oppgaven
				const taskId = this.tasks[index].id
				
				//Vis en bekreftelsesdialog til brukeren
				const confirmation = window.confirm(`Set '${this.tasks[index].title}' to ${newStatus}?`);
				
				if(confirmation && this.changeCallback){
					
					//Kjør callback dersom brukeren bekrefter endringen
					this.changeCallback(taskId, newStatus);
				}
			});
			
		});*/
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    deletetaskCallback(callback) {      
		this.deleteCallback = callback;
		
		/*
		//Finn alle delete-knapper i listen
		const deleteButtons = this.shadow.querySelectorAll('button[type="button"]');
		
		//Legg til en event-listener for hver knapp
		deleteButtons.forEach((button, index) => {
			button.addEventListener('click', () => {
				
				//Henter id for tilhørende oppgave
				const taskId = this.tasks[index].id;
			
				//Bekreftelsesdialog
				const confirmation = window.confirm(`Are you sure you want to delete task ${this.tasks[index].title}?`);			
			
				
				if(confirmation && this.deleteCallback){
					this.deleteCallback(taskId);
				}
			});
		});
		*/
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {
		console.log("Legger til oppgave:", task);
		
		//Klone en ny rad fra taskrow-template
		const row = taskrow.content.cloneNode(true);
		
		//Fyller inn data fra task-objektet
		row.querySelector('td:nth-child(1)').textContent = task.title;
		row.querySelector('td:nth-child(2)').textContent = task.status;
		
		const selectElement = row.querySelector('select');
		console.log(selectElement);
		
		if(selectElement){
		this.statuses.forEach(status => {
			const option = document.createElement('option');
			option.value = status;
			option.textContent = status; 
			if(status === task.status){
				option.status = true; 
			}
			selectElement.appendChild(option);
		});
		}	else {
	        console.error("Select-elementet ble ikke funnet!");
	    }
			
			//Finn listens tablebody
			const taskTableBody = this.shadow.querySelector('tbody');
			
			//Legg til raden øverst i tabell
			taskTableBody.insertBefore(row, taskTableBody.firstChild);
			console.log(taskTableBody);
			
			//Legg til den nye oppgaven i øverst i listen
			this.tasks.unshift(task);
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {
        const taskId = task.id;
		const newStatus = task.status;
		
		//Finn indeks til oppgaven i tabellen
		const taskIndex = this.tasks.findIndex(t => t.id === taskId);
		
		//Oppdater status dersom oppgaven ble funnet
		if(taskIndex !== -1){
			
			//oppdater status i tasks-tabell
			this.tasks[taskIndex].status = newStatus;
			
			// Finn raden som tilsvarer denne oppgaven i tabellen
			const taskTableBody = this.shadow.querySelector('tbody');
			const taskRow = taskTableBody.children[taskIndex];
			
			// Finn <select> elementet i raden
			const selectElement = taskRow.querySelector('select');
			
			// Oppdater <select> elementet til den nye statusen
			selectElement.value = newStatus;
			
			
		}		else {
		        console.error(`Oppgave med ID ${taskId} ble ikke funnet.`);
		}
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {
		//Finn indeks på oppgaven som skal fjernes
		const taskIndex = this.tasks.findIndex(t => t.id === id);
		
		//Dersom oppgave ble funnet
		if(taskIndex !== -1){
			
			//Fjerner oppgaven fra tasks-listen
			this.tasks.splice(taskIndex, 1);
			
			//finner tablebody med alle oppgaver
			const taskTableBody = this.shadow.querySelector('tbody');
			
			//Fjerner rad fra view
			const taskRow = taskTableBody.children[taskIndex];
			taskTableBody.removeChild(taskRow);
		}		else { //Skriver ut feilmelding i konsoll dersom det ikke finnes en oppgave med gitt id
		        console.error(`Oppgave med ID ${id} ble ikke funnet.`);
		}
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
		// Returner lengden på den interne listen over oppgaver (this.tasks)
		return this.tasks.length;
    }
}
customElements.define('task-list', TaskList);
