const requestModal = document.querySelector('.new-request');
const requestLink = document.querySelector('.add-request');

//open request modal
requestLink.addEventListener('click',()=>{
    requestModal.classList.add('open');
})

//close the modal 
requestModal.addEventListener('click',(e)=>{
    if(e.target.classList.contains('new-request')){
        requestModal.classList.remove('open');
    }
})

//say hello functio
const button = document.querySelector('.call');
button.addEventListener('click',()=>{
    //get functions rederence
    const sayHello = firebase.functions().httpsCallable('sayHello');
    sayHello({name: 'Mahidul'}).then(result=>{
        console.log(result.data);
    });
})