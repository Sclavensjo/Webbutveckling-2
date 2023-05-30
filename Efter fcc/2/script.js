box = document.querySelector(".ruta")
tex = document.querySelector(".text1")

box.addEventListener("click", e=>{
    if (box.className == "ruta"){
        box.className = "ruta2"
        tex.innerHTML = "tjena"
        
    } else if (box.className == "ruta2"){
        box.className = "ruta3"
        tex.innerHTML = "hallå"
    } else {
        box.className = "ruta"
        tex.innerHTML = "hej"
    }
})
