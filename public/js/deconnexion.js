const btnDeconnexion = document.getElementById('btn_deconnexion');

if (btnDeconnexion) {
 async function deconnexion(event){
    event.preventDefault(); 
    console.log('mus')
    const response = await fetch('/api/deconnexion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        window.location.href = '/'; 
    }
};

btnDeconnexion.addEventListener('click', deconnexion) 
}