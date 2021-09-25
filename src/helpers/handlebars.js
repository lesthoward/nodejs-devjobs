module.exports = {
    selectSkills: (selected=[], options) => {
        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];

        const skillHTML = skills.map(singleSkill => {
            // The config below is supported to works in Ubuntu
            const exist = selected.some(singleSelected => {
                return singleSelected === singleSkill
            })

            return  `<li class="${exist ? 'activo' : ''}">${singleSkill}</li>`
        }).join('')
        return skillHTML
    },

    typeContract: (typeContract, options) => {
        const text = options.fn().replace(new RegExp(`value="${typeContract}"`,), '$& selected')
        return text
    },

    showErrors: (errors={}) => {
        const messageLevel = Object.keys(errors)[0]
        const newErrors = errors[messageLevel]
        if(!messageLevel) return

        // The original className is error in CSS  and not errors like I'm passing to this function 
        let className = messageLevel
        switch(messageLevel) {
            case 'errors':
                 className='error'   
                break
        }
        return newErrors.map(error => `
            <div class="alerta ${className}">${error}</div>
        `)
    }
}