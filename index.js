let rects = [];
let rect = null;
let canvasEle = document.querySelector('#myCanvas');
let width = canvasEle.width;
let height = canvasEle.height;




const utils = {

    getMousePositionInCanvas: (event, canvasEle) => {
      let {clientX, clientY} = event;
      let {left, top} = canvasEle.getBoundingClientRect();
      return {
        x: clientX - left,
        y: clientY - top
      };
    },
  
    isPointInRect: (rect, point) => {
      let {x: rectX, y: rectY, width, height} = rect;
      let {x: pX, y: pY} = point;
      return (rectX <= pX && pX <= rectX + width) && (rectY <= pY && pY <= rectY + height);
    },

    unselectRectExclude(index){
      for(let rect of rects){
          rect.selected = false;
      }
    },

    selecRect(point){
      for(let rect of rects){
        if(this.isPointInRect(rect,point)){
          rect.selected = true;
          return rect;
        }
      }
      let {x: pX, y: pY} = point;
      let ans = {x:pX,y:pY,width:10,height:10,selected:true,hover:false};
      rects.push(ans);
      return ans;
    },

    hoverRect(point){
      for(let key in rects){
        if(this.isPointInRect(rects[key],point)){
          rects[key].hover = true;
          return;
        }
      }
    }
  };


  class Calc1{
    // 多项式拟合
    constructor(points){
      this.points = points;
      this.parameters = [];
      this.calcParameters();
    } 
    calcParameters(){
        let A = []
        let b = []
        for(let point of this.points){
            let x = point[0];
            let y = point[1];
            let row = [];
            for(let i=0;i<this.points.length;i++){
                row.push(math.pow(x,i));
            }
            A.push(row);
            b.push(y);
        }
        if(math.det(A) != 0){
           this.parameters = math.multiply(math.inv(A),b);
        }
    }

    calc(x){
      let ans = 0;
      for(let i=0;i<this.parameters.length;i++){
          ans += math.pow(x,i)*this.parameters[i];
      }
      return ans;
    }
  }
  


  class Calc2{
    // 高斯基函数
    g = 2000;
    constructor(points){
      this.points = points;
      this.parameters = [];
      this.calcParameters();
    } 

    calcParameters(){
        let A = []
        let b = []
        for(let point of this.points){
            let x = point[0];
            let y = point[1];
            let row = [];
            for(let i=0;i<this.points.length;i++){
              let xi = this.points[i][0];
              row.push(math.exp(-(x-xi)*(x-xi)/this.g));
            }
            A.push(row);
            b.push(y);
        }
        if(math.det(A) != 0){
         this.parameters = math.multiply(math.inv(A),b);
        }
    }

    calc(x){
      let ans = 0;
      for(let i=0;i<this.parameters.length;i++){
        let xi = this.points[i][0];
        ans += this.parameters[i]*math.exp(-(x-xi)*(x-xi)/this.g);
      }
      return ans;
    }
  }
  

  class Calc3{
    // 最小二乘
    constructor(points,n,lambda){
      this.points = points;
      this.parameters = [];
      this.n = n;
      this.lambda = lambda;
      this.calcParameters();
    } 
    calcParameters(){
        let A = []
        let b = []
        for(let point of this.points){
            let x = point[0];
            let y = point[1];
            let row = [];
            for(let i=0;i<=this.n;i++){
                row.push(math.pow(x,i));
            }
            A.push(row);
            b.push(y);
        }
        let AT = math.transpose(A);
        let bb = math.multiply(AT,b);
        let AA = math.multiply(AT,A);
        for(let i=0;i<AA.length;i++){
          AA[i][i] += this.lambda;
        } 
        if(math.det(AA) != 0){
          this.parameters = math.multiply(math.inv(AA),bb);
        }

    }

    calc(x){
      let ans = 0;
      for(let i=0;i<this.parameters.length;i++){
          ans += math.pow(x,i)*this.parameters[i];
      }
      return ans;
    }
  }


data = {

}

  class Calc4{
    // RBF

    constructor(points){
      this.points = points;
      let key = this.points.toString();
      this.para_n = 4;
      this.iter_num = 1000;
      this.learning_rate = 0.001;
      if(key in data){
        this.c_arr = data[key][0];
        this.w_arr = data[key][1];
        this.beta_arr = data[key][2];
      }else{
        this.c_arr = [];
        this.w_arr = [];
        this.beta_arr = [];
        this.calcParameters();
        data[key] = [this.c_arr,this.w_arr,this.beta_arr]
      }

    } 

    w_gradient(j){
      let ans = 0;
      for(let i=0;i<this.points.length;i++){
        let x = this.points[i][0];
        let y = this.points[i][1];
        let loss = this.calc(x) - y;
        ans += loss*this.G(x,j);
      }
      return ans;
    }

    G(x,j){
      return math.exp(-(x-this.c_arr[j])*(x-this.c_arr[j])/this.beta_arr[j]/this.beta_arr[j]);
    }

    c_gradient(j){
      let ans = 0;
      for(let i=0;i<this.points.length;i++){
        let x = this.points[i][0];
        let y = this.points[i][1];
        let loss = this.calc(x) - y;
        ans += loss*this.w_arr[j]*this.G(x,j)*2*(x-this.c_arr[j])/this.beta_arr[j]/this.beta_arr[j];
      }
      return ans;
    }

    beta_gradient(j){
      let ans = 0;
      for(let i=0;i<this.points.length;i++){
        let x = this.points[i][0];
        let y = this.points[i][1];
        let loss = this.calc(x) - y;
        ans += loss*this.w_arr[j]*this.G(x,j)*(-2)*(x-this.c_arr[j])*(x-this.c_arr[j])/math.pow(this.beta_arr[j],3);
      }
      return ans;
    }

  
    calcParameters(){
      for(let i=0;i<this.para_n;i++){
        let j = Math.random()*this.points.length;
        j = parseInt(j);
        this.c_arr[i] = this.points[j][0];
        this.w_arr[i] = Math.random();
        this.beta_arr[i] = 300*Math.random();
      }
      for(let i=0;i<this.iter_num;i++){
        for(let j=0;j<this.para_n;j++){
          this.w_arr[j] -= this.w_gradient(j)*this.learning_rate;
          this.c_arr[j] -= this.c_gradient(j)*this.learning_rate;
          this.beta_arr[j] -= this.beta_gradient(j) * this.learning_rate;
        }
        // let loss = 0;
        // for(let i=0;i<this.points.length;i++){
        //   let x = this.points[i][0];
        //   let y = this.points[i][1];
        //   let gap = this.calc(x) - y;
        //   loss += gap * gap;
        // }
      }
    }

    calc(x){
      let ans = 0;
      for(let i=0;i<this.para_n;i++){
        ans += this.w_arr[i]*this.G(x,i);
      }
      return ans;
    }
  }


  function drawCurve(arr,color){
    ctx.beginPath();
    ctx.strokeStyle  = "rgba("+color+",0,0,1)";
    ctx.moveTo(arr[0][0],arr[0][1]);
    for(let i=1;i<arr.length;i++){
        ctx.lineTo(arr[i][0],arr[i][1]);
    }
    ctx.stroke();
    ctx.closePath();
}


let Calcs = [[Calc1]];


function run(){
  let index = 0;
    for(let calc_arr of Calcs){
      Calc = calc_arr[0];
      let para1 = null;
      let para2 = null;
      if(calc_arr.length > 1){
        para1 = calc_arr[1];
        para2 = calc_arr[2];
      }
      let values = []
      for(let i=0;i<rects.length;i++){
          values.push([rects[i]['x'],rects[i]['y']]);
      }
      let cal = null;
      if(para1 != null){
        cal = new Calc(values,para1,para2);
      }else{
        cal = new Calc(values);
      }
      let arr = [];
      for(let x=0;x<width;x++){
          let y = cal.calc(x);
          arr.push([x,y]);
      }
      drawCurve(arr,parseInt(math.random()*255));
      index += 1;
    }
}

  

  canvasEle.addEventListener('mousedown', event => {
    let point = utils.getMousePositionInCanvas(event, canvasEle);
    rect = utils.selecRect(point);
  });
  
  let mousePosition = null;
  canvasEle.addEventListener('mousemove', event => {
    if(rect == null){
      return;
    }
    let lastMousePosition = mousePosition;
    mousePosition = utils.getMousePositionInCanvas(event, canvasEle);
    utils.hoverRect(mousePosition);
    rect.hover = utils.isPointInRect(rect, mousePosition);
  
    let buttons = event.buttons;
    if (!(buttons === 1 && rect.selected)) {
      return;
    }
  
    let offset;
    if (lastMousePosition === null) {
      offset = {
        dx: 0,
        dy: 0
      };
    } else {
      offset = {
        dx: mousePosition.x - lastMousePosition.x,
        dy: mousePosition.y - lastMousePosition.y
      };
    }
    rect.x = rect.x + offset.dx;
    rect.y = rect.y + offset.dy;
  
  });
  
  

  canvasEle.addEventListener('mouseup', () => {
    if(rect != null){
      rect.selected = false;
      rect.hover = false;
    }
  });
  
  let ctx = canvasEle.getContext('2d');
  (function doRender() {
    requestAnimationFrame(() => {

      (function render() {
        ctx.clearRect(0, 0, canvasEle.width, canvasEle.height);
        ctx.save();

        if(rect == null){
          return;
        }
        if (rect.selected) {
          ctx.strokeStyle = '#FF0000';
          canvasEle.style.cursor = 'move';
        } else if (rect.hover) {
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
          canvasEle.style.cursor = 'pointer';
        } else {
          ctx.strokeStyle = '#000';
          canvasEle.style.cursor = 'default';
        }
  
        for(let rect of rects){
          ctx.strokeRect(rect.x - 0.5, rect.y - 0.5, rect.width, rect.height);
        }
        run();
        ctx.restore();
      })();
      doRender();
  
    });
  })();