class MoveAbleObject {
    constructor(position, size, isEllipse) {
        this.position = position
        this.size = size
        this.isEllipse = isEllipse
        this.moving = false
        this.resizing = false
        this.resizingLastFrame = false
        this.resizeDirection = createVector(0,0)
        this.createResizeArea = function() {
            if(this.isEllipse) {
                return {
                    x: (this.position.x - this.size.x/2 -10),
                    y: (this.position.y - this.size.y/2 -10),
                    w: (this.position.x + this.size.x/2 + 10),
                    h: (this.position.y + this.size.y/2 + 10)
                }
            }
            return {
                x: (this.position.x -10),
                y: (this.position.y -10),
                w: (this.size.x + 20),
                h: (this.size.y + 20)
            }
        }
        this.resizeArea = this.createResizeArea()
        this.checkCursorInShape = function() {
            if(this.isEllipse) {
                return(mouseX > this.position.x - this.size.x/2 && mouseX < this.position.x + this.size.x/2 && mouseY > this.position.y - this.size.y/2 && mouseY < this.position.y + this.size.y/2)
            }
            return(mouseX > this.position.x && mouseX < this.position.x + this.size.x && mouseY > this.position.y && mouseY < this.position.y + this.size.y)
        }
        this.checkCursorInResizeArea = function() {
            if(this.isEllipse) {
                return(mouseX > this.resizeArea.x && mouseX < this.resizeArea.w && mouseY > this.resizeArea.y && mouseY < this.resizeArea.h)
            }
            return(mouseX > this.resizeArea.x && mouseX < this.resizeArea.x + this.resizeArea.w && mouseY > this.resizeArea.y && mouseY < this.resizeArea.y + this.resizeArea.h)
        }
        this.mousePressed = function(){
            if(this.checkCursorInShape()) {
                this.moving = true
            }
            else if(this.checkCursorInResizeArea()) {
                this.resizing = true
            }
        }
        this.move = function() {
            if(this.moving) {
                if(this.isEllipse) {
                    this.position.x = mouseX
                    this.position.y = mouseY
                }
                else {
                    this.position.x = mouseX - this.size.x/2
                    this.position.y = mouseY - this.size.y/2
                }
                this.resizeArea = this.createResizeArea()
                    
            }
        }
        this.resize = function() {
            if(this.checkCursorInResizeArea() && !this.checkCursorInShape()) {
                if(this.isEllipse) {
                    if(mouseX < this.position.x - this.size.x/2 || mouseX > this.position.x + this.size.x/2) {
                        cursor('ew-resize')
                    }
                    else if(mouseY < this.position.y - this.size.y/2 || mouseY > this.position.y + this.size.y/2) {
                        cursor('ns-resize')
                    }
                }
                else {
                    if(mouseX < this.position.x|| mouseX > this.position.x + this.size.x) {
                        cursor('ew-resize')
                    }
                    else if(mouseY < this.position.y|| mouseY > this.position.y + this.size.y) {
                        cursor('ns-resize')
                    }
                }
            }
            if(this.resizing) {
                if(!this.resizingLastFrame) {
                    if(this.isEllipse) {
                        if(mouseX < this.position.x - this.size.x/2) {
                            this.resizeDirection = createVector(-1,0)
                        }
                        else if(mouseX > this.position.x + this.size.x/2) {
                            this.resizeDirection = createVector(1,0)
                        }
                        else if(mouseY < this.position.y - this.size.y/2) {
                            this.resizeDirection = createVector(0,-1)
                        }
                        else if(mouseY > this.position.y + this.size.y/2) {
                            this.resizeDirection = createVector(0,1)
                        }
                    }
                    else {
                        if(mouseX < this.position.x) {
                            this.resizeDirection = createVector(-1,0)
                        }
                        else if(mouseX > this.position.x + this.size.x) {
                            this.resizeDirection = createVector(1,0)
                        }
                        else if(mouseY < this.position.y) {
                            this.resizeDirection = createVector(0,-1)
                        }
                        else if(mouseY > this.position.y + this.size.y) {
                            this.resizeDirection = createVector(0,1)
                        }
                    }
                }
                else {
                    if(!this.isEllipse) {
                        if(this.resizeDirection.x < 0) {
                            this.position.x = mouseX
                        }
                        else if(this.resizeDirection.y < 0) {
                            this.position.y = mouseY
                        }
                    }
                    this.size.add(createVector((mouseX - pmouseX)*this.resizeDirection.x, (mouseY - pmouseY)*this.resizeDirection.y))
                    if(this.isEllipse) {
                        this.position.add(createVector((mouseX - pmouseX)*this.resizeDirection.x/2, (mouseY - pmouseY)*this.resizeDirection.y/2))
                        if(this.resizeDirection.x < 0) {
                            this.position.x = mouseX + this.size.x/2
                        }
                        else if(this.resizeDirection.y < 0) {
                            this.position.y = mouseY + this.size.y/2
                        }
                    }
                }
            }
            this.resizeArea = this.createResizeArea()
            this.resizingLastFrame = this.resizing
        }
    }
}
class LightSource extends MoveAbleObject{
    constructor(position, handleSize, lightSize, lightColor, rayCount, angleStart, angleEnd) {
        super(position, handleSize, true)
        this.color = lightColor;
        this.angleStart = angleStart
        this.angleEnd = angleEnd
        this.rayCount = rayCount
        this.lightSize = lightSize
        this.lightColor = lightColor
        this.populateRaysArray = function() {
            let array = []
            for(let i = 1; i <= rayCount; i++) {
                array.push(new Ray(position, this.lightSize, this.angleStart + (this.angleEnd-this.angleStart)/this.rayCount*i))
            }
            return array
        }
        this.rays = this.populateRaysArray()
        this.drawHandle = function() {
            fill(255);
            ellipse(this.position.x,this.position.y,handleSize.x,handleSize.y);
        }
        this.drawShape = function() {
            this.rays.forEach(ray => {
                ray.checkCollision();
            });
            for(let i = 0; i < 100; i++) {
                fill(color(red(this.lightColor),green(this.lightColor), blue(this.lightColor),i*.1))
                beginShape()
                vertex(this.position.x, this.position.y)
                for(let j = 0; j < this.rays.length; j++) {
                    let newTargetPoint = this.rays[j].targetPoint.copy()
                    newTargetPoint.sub(newTargetPoint.copy().sub(this.position).mult(0.01*i))
                    
                    let collisionPointDist = dist(this.rays[j].collisionPoint.x, this.rays[j].collisionPoint.y, this.position.x, this.position.y)
                    let newTargetPointDist = dist(newTargetPoint.x, newTargetPoint.y, this.position.x, this.position.y)
                    if(newTargetPointDist > collisionPointDist) {
                        newTargetPoint = this.rays[j].collisionPoint.copy()
                    }
                    vertex(newTargetPoint.x, newTargetPoint.y)
                }
                endShape(CLOSE)                
            }
        }
        this.spin = function(delta) {
            this.angleStart += delta
            this.angleEnd += delta
            if(this.angleStart > 360) {
                this.angleStart -= 360
                this.angleEnd -= 360
            }
            if(this.angleStart < 0) {
                this.angleStart += 360
                this.angleEnd += 360
            }
            for(let i = 0; i < this.rayCount; i++) {
                this.rays[i].rotation = this.angleStart + (this.angleEnd-this.angleStart)/this.rayCount*i
            }
        }
    }
}
class Ray {
    constructor(origin, length, r) {
        this.origin = origin
        this.length = length
        this.rotation = r
        this.targetPoint = createVector(this.origin.x + cos(this.rotation) * this.length, this.origin.y + sin(this.rotation) * this.length)
        this.collisionPoint = createVector(this.origin.x + cos(this.rotation) * this.length, this.origin.y + sin(this.rotation) * this.length)
        this.draw = function() {
            line(this.origin.x, this.origin.y, this.collisionPoint.x, this.collisionPoint.y)
        }
        this.checkCollision = function() {
            this.targetPoint = createVector(this.origin.x + cos(this.rotation) * this.length, this.origin.y + sin(this.rotation) * this.length)
            for(let i = 0; i <= 1; i+=0.001) {
                let checkPoint = p5.Vector.lerp(this.origin,this.targetPoint, i)
                if(pointInsideObstacle(checkPoint)) {
                    fill(255,0,0)
                    this.collisionPoint = checkPoint
                    break;
                }
                else{
                    this.collisionPoint = this.targetPoint
                
                }
            }
        }
        
    }
}
class Obstacle extends MoveAbleObject{
    constructor(position, size, c, isEllipse) {
        super(position, size, isEllipse)
        this.draw = function() {
            fill(c)
            if(this.isEllipse) {
                ellipse(this.position.x,this.position.y,size.x,size.y)
            }
            else {
            rect(this.position.x, this.position.y, this.size.x, this.size.y)
            }
        }
    }
}

let light
let obstacles = []
function setup() {
    noStroke()
    let canvasWidth = ((windowWidth/3)*2)
    let canvasHeight = ((windowHeight/3)*2)
    let cnv = createCanvas(canvasWidth, canvasHeight);
    cnv.position((windowWidth/6), (windowHeight/6));    
    angleMode(DEGREES)
    background(0);
    light = new LightSource(createVector(200,200), createVector(10,10),100,color(0,255,0),50, 0, 45);
    light2 = new LightSource(createVector(150,210), createVector(10,10),300,color(255,0,0),50, 0, 90);
    for(let i = 0; i <6; i++) {
        obstacles.push(new Obstacle(createVector(random(0,width),random(0,height)),createVector(random(50,200),random(50,200)),color(random(0,255),random(0,255),random(0,255))));
    } 


    //SETUP HTML FUNCTIONS
    select("#radius-input").input(function() {
        light.lightSize = this.value()  
        for(let i = 0; i < light.rayCount; i++) {
            light.rays[i].length = this.value()
        }
    })
    select("#angle-input").input(function() {
        light.angleEnd = light.angleStart + Number(this.value())
        for(let i = 0; i < light.rayCount; i++) {
            light.rays[i].rotation = light.angleStart + (light.angleEnd-light.angleStart)/light.rayCount*i
        }
    });

    select("#rayCount-input").input(function() {
        light.rayCount = this.value()
        light.rays = []
        for(let i = 1; i <= light.rayCount; i++) {
            light.rays.push(new Ray(light.position, light.lightSize, light.angleStart + (light.angleEnd-light.angleStart)/light.rayCount*i))
        }
    });
    select("#color-input").input(function() {
        light.lightColor = color(this.value())
    });
}

function draw() {
    cursor(ARROW)
    background(0);
    obstacles.forEach(obstacle => {
        obstacle.draw()
    });
    blendMode(ADD)
    light.drawShape();
    light2.drawShape();
    blendMode(BLEND)
    light.drawHandle();
    light2.drawHandle();
    light.move();
    light2.move();
    if(light.moving) {
        light.move()

        return;
    }
    if(light2.moving) {
        light2.move()
        return;
    }
    for(let i = obstacles.length-1; i >= 0; i--) {
        if(obstacles[i].resizing) {
            obstacles[i].resize()
            break;
        }
        if(obstacles[i].moving) {
            obstacles[i].move()
            break;
        }
        obstacles[i].resize()
        obstacles[i].move()
    }
    
}

function pointInsideObstacle(point) {
    for(let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i]
        if(point.x > obstacle.position.x && point.x < obstacle.position.x + obstacle.size.x && point.y > obstacle.position.y && point.y < obstacle.position.y + obstacle.size.y) {
            return true
        }
    }
}

function mousePressed() {
    obstacles.forEach(obstacle => {
        obstacle.mousePressed()
    });
    light.mousePressed()
    light2.mousePressed()
}
function mouseReleased() {
    obstacles.forEach(obstacle => {
        obstacle.moving = false
        obstacle.resizing = false
    });
    light.moving = false
    light2.moving = false
}
function mouseWheel(event)
{
    light.spin(event.delta/20)
}

