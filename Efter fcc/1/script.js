document.querySelector("#minfinadiv").innerHTML = "tjena";

let li = document.createElement("li");
let li2 = document.createElement("li");
li.append("punkt 4");
li2.append("punkt 0");
document.querySelector("#minlista").append(li);
document.querySelector("#minlista").prepend(li2);
document.querySelector("#punk2").remove();

let div = document.createElement("div");
let p = document.createElement("p");
p.append("Tjena tjenas");
div.append(p);
document.querySelector("#minfinadiv").append(div);
let i = 5
function addpunkt(){
    let nyli = document.createElement("li");
    nyli.append("punkt"+i)
    document.querySelector("#minlista").append(nyli)
    i++
}
