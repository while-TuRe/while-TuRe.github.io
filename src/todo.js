let parentNode = document.body.querySelector(".todos"),   //todos主体 
  arrows = document.body.querySelector(".input span"),  //下拉箭头  
  tailNode = parentNode.querySelector(".tail"),         //尾部选项主体
  tailNode_A = tailNode.querySelectorAll("A"),          //选项标签集合
  A_status = "all",     //选项状态
  local_notes = [],          //缓存变量
  init_status = false,   //初始化状态(用于初始化完成后正常缓存)
  item_num = 0


function setpage(val, index){
  if (index === 0) {
    A_status = val   //选项标签状态初始化
    tail(document.body.querySelector("." + A_status))  //选项标签初始化
  } else {
    let node = add_todo(val[0])                    //读取localStorage添加问题节点
    if (val[1]) 
      tick(node.querySelector(".tick"))  //读取localStorage选择问题打勾
    parentNode.appendChild(node) //避免闪烁问题
    todo_status()
  }
}
window.onload = function(){     //页面初始化开始
  //localStorage.local_notes=[]
  if (!localStorage.local_notes) 
    local_notes = [A_status]   //如果第一次加载页面则不必要读取localStorage
  else {
    init_status = true   //进入初始化状态
    local_notes = JSON.parse(localStorage.local_notes)
    local_notes.forEach(setpage)
    init_status = false //页面初始化结束
  }
}


/*更新localStorage配置:
                    1: 添加问题 
                    2：修改问题 
                    3: 删除问题(包括清除按钮) 
                    4: 选择(取消选择)问题  
                    5：选项改变
*/
function update_localStorage(num, value) {
  if (init_status) return
  if (num === 1)
    { local_notes.push([value, false]);}
  else if (num === 5) local_notes[0] = value
  else {
    let nodes = Array.isArray(value) ? value[0].parentNode.children : value.parentNode.children,
      count = 0
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].classList.contains("undown")) 
        count++
      if (nodes[i] === (value[0] ? value[0] : value)) 
        break
    }
    if (num === 2 && count !== 0) local_notes[count][0] = value[1]
    if (num === 3 && count !== 0) local_notes.splice(count, 1)
    if (num === 4 && count !== 0) local_notes[count][1] = value[1]
  }
  localStorage.local_notes = JSON.stringify(local_notes)
}

document.onkeypress = function(e){
  if (e.key === 'Enter') {
    if (e.target.className === "new-todo"  && e.target.value !== ""){
      add_todo(e.target.value)
      e.target.value=""
    }
    else if(e.target.className ==="reinput")
      reinput(e.target)
  }
}

document.onclick = function(e){   //单击事件
  if (e.target.className !== "reinput") reinput()    //修改问题的input输入框
  if(e.target.className ==="search") search()
  if (e.target === arrows) tick("arrows")            //箭头单击事件
  if (e.target.classList.contains("tick")) tick(e.target)  //问题选择单击事件
  if (tailNode.contains(e.target))
    {
      tail(e.target)   //选项选择单击事件
    }
  if (e.target.className === "item") {         //删除问题单击事件
    if (!e.target.parentNode.querySelector(".tick_on")){
      tailNode.firstElementChild.textContent = --item_num+ " items left"
      if(item_num===0)
        arrows.style.color = "rgba(0, 0, 0, .2)"
    }
    update_localStorage(3, e.target.parentNode)
    parentNode.removeChild(e.target.parentNode)
  }
}


document.ondblclick = (e) => {   //双击事件,用于修改问题
  if (e.target.classList.contains("question")) {
    let nodes = e.target.parentNode.children
    for (let i = 0; i < nodes.length; i++)
      nodes[i].style.display = "none"
    let node = document.createElement("input")
    node.className = "reinput"
    node.value = e.target.innerHTML
    e.target.parentNode.appendChild(node)
    node.focus()
    node.selectionStart = 0
  }
}


/*通过 clonenode 一个不显示的newNode实现*/
function add_todo(value) {  //添加问题
  let newNode = document.body.querySelector(".todo").cloneNode(true)
  newNode.classList.add("undown")
  newNode.lastChild.innerHTML = value
  newNode.style.display = A_status === "completed" ? "none" : "flex"
  if (!init_status) parentNode.appendChild(newNode)
  update_localStorage(1, value)
  document.body.querySelector(".input").lastElementChild.value = ""
  arrows.style.visibility = "visible"
  tailNode.firstElementChild.textContent = ++item_num + 'items left';
  if(item_num!==0)
        arrows.style.color = "black"
  return newNode
}


function reinput() {   //修改问题
  let node = parentNode.querySelector(".reinput")
  if (node) {
    let nodes = node.parentNode.children, str = node.value
    update_localStorage(2, [node.parentNode, str])
    node.parentNode.removeChild(node)
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].style.display = ""
      if (nodes[i] === nodes[i].parentNode.lastChild) nodes[i].innerHTML = str
    }
  }
}

function search(){
  let value = document.body.querySelector('.new-todo').value;
  let nodes =  document.body.querySelectorAll(".todo")
  console.log(value)
  for (let i = 0; i < nodes.length; i++)
    if(nodes[i].lastChild.innerHTML.indexOf(value)===-1)    
      nodes[i].style.display = "none"
}
function tick(node) {       //选择标签函数
  if (node === "arrows") {
    let nodes = document.body.querySelectorAll(".tick")
    if (item_num !== 0) {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].classList.contains("tick_on") && nodes[i].parentNode.parentNode.classList.contains("undown")) 
          tick(nodes[i])
      }
    } else for (let i = 0; i < nodes.length; i++) tick(nodes[i])
  } else {
    if (node.classList.contains("tick_on")) {
      node.classList.remove("tick_on")
      update_localStorage(4, [node.parentNode.parentNode, false])
      if (!document.querySelector(".tick_on")) tailNode.querySelector(".clear_completed").style.display = "none"
      node.parentNode.parentNode.lastChild.classList.remove("line_through")
     
      if (!init_status) todo_status()
    } else {
      node.classList.add("tick_on")
      update_localStorage(4, [node.parentNode.parentNode, true])
      node.parentNode.parentNode.lastChild.classList.add("line_through")
      tailNode.querySelector(".clear_completed").style.display = "inline"
      
      if (!init_status) todo_status()
    }
  }
}


function tail(node) {    //选项选择函数开始
  if (node.nodeName === "A") {
    for (let i = 0; i < tailNode_A.length; i++) 
      tailNode_A[i].style["border-color"] = "rgba(255,255,255,0)"
    node.style["border-color"] = "orange"
    A_status = node.className
    update_localStorage(5, A_status)
    if (!init_status) todo_status()
  }
  if (node.className === "clear_completed") {
    let nodes = parentNode.querySelectorAll(".tick_on")
    for (let i = 0; i < nodes.length; i++) {
      update_localStorage(3, nodes[i].parentNode.parentNode)
      parentNode.removeChild(nodes[i].parentNode.parentNode)
      tailNode.firstElementChild.textContent = --item_num + 'items left';
    }
    tailNode.querySelector(".clear_completed").style.display = "none"
  }
}

function todo_status() {     //选项选择函数进行
  if (A_status === "active") {
    let nodes = parentNode.querySelectorAll(".undown")
    for (let i = 0; i < nodes.length; i++) nodes[i].style.display = "flex"
    nodes = parentNode.querySelectorAll(".tick_on")
    for (let i = 0; i < nodes.length; i++) nodes[i].parentNode.parentNode.style.display = "none"
  }
  if (A_status === "all") {
    let nodes = parentNode.querySelectorAll(".undown")
    for (let i = 0; i < nodes.length; i++) nodes[i].style.display = "flex"
  }
  if (A_status === "completed") {
    let nodes = parentNode.querySelectorAll(".undown")
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].style.display === "flex") nodes[i].style.display = "none"
    }
    nodes = parentNode.querySelectorAll(".tick_on")
    for (let i = 0; i < nodes.length; i++) nodes[i].parentNode.parentNode.style.display = "flex"
  }
}


// //切换屏幕 （横屏竖屏）
// window.addEventListener("orientationchange", resetrem);
// //resize：屏幕的大小发生改变就触发监听事件resetrem
// window.addEventListener("resize",resetrem);

// function resetrem(){
//     var html = document.querySelector("html");//获取到html元素
//     var width = html.getBoundingClientRect().width;//获取屏幕的宽度
//     html.style.fontSize = width/16+"px";
// }
