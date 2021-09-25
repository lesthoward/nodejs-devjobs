import Swal  from 'sweetalert2'

// SKILLS SELECTION
const $skills = document.querySelector('.lista-conocimientos'); 
const $skillsInput = document.querySelector('#skills');
const selectedSkills  = new Set()
if($skills) {
    $skills.addEventListener('click', selectSkill)
    printIntoArray()
}
function selectSkill(e) {
    if(e.target.tagName === 'LI') {
        if(e.target.classList.contains('activo')) {
            selectedSkills.delete(e.target.textContent) 
        } else {
            selectedSkills.add(e.target.textContent) 
        }
        e.target.classList.toggle('activo')
        $skillsInput.value = [...selectedSkills]
        
    }
}

// Skills selector by creating a new vacancy or edit it
function printIntoArray () {
    const $selectedInHTML =  Array.from(document.querySelectorAll('.lista-conocimientos .activo'))
    // Reusing the same set array
    $selectedInHTML.forEach(selected => {
        selectedSkills.add(selected.textContent)
    })
    $skillsInput.value = [...selectedSkills]
}


// Each alert is removing after 1.5 seconds
const alertsContainer = document.querySelector('.alertas')
if(alertsContainer) {
    const interval = setInterval(() => {
        if(alertsContainer.children.length) {
            alertsContainer.children[0].remove()
        } else {
            clearInterval(interval)
        }
    }, 3000)
}

// Remove a vacancy from JavaScript to node.js
const vacancyContainer = document.querySelector('.lista-vacantes');
if(vacancyContainer) {
    vacancyContainer.addEventListener('click', e => {
        if(e.target.dataset.delete) {
            e.preventDefault()
            Swal.fire({
                title: '¿Estás seguro?',
                text: "No serás capaz recuperar este dato",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar'
              }).then((result) => {
                if (result.isConfirmed) {
                    const url = e.target.dataset.delete
                    const xhttp = new XMLHttpRequest()
                    xhttp.onreadystatechange = () => {
                        if(xhttp.readyState === 4 && xhttp.status === 200) {
                            e.target.parentNode.parentNode.remove()
                        }
                    }
                    xhttp.open('DELETE', url)
                    xhttp.send()
                    Swal.fire(
                        'Eliminado',
                        `La vacante ha sido eliminada`,
                        'success'
                    )
                }
              })


        }
    })
}
