!function(){for(var e=document.querySelectorAll(".youtube"),t=0;t<e.length;t++){var r="https://img.youtube.com/vi/"+e[t].dataset.embed+"/sddefault.jpg",a=new Image;a.src=r,a.addEventListener("load",void e[t].appendChild(a)),e[t].addEventListener("click",function(){var e=document.createElement("iframe");e.setAttribute("frameborder","0"),e.setAttribute("allowfullscreen",""),e.setAttribute("src","https://www.youtube.com/embed/"+this.dataset.embed+"?rel=0&showinfo=0&autoplay=1"),this.innerHTML="",this.appendChild(e)})}}();