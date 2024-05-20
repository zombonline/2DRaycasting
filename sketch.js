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
            if(this.checkCursorInShape() || this.checkCursorInResizeArea()) {
                selectedLight = undefined
                selectedObstacle = undefined
                document.getElementById("light-settings").style.display = "none"
                document.getElementById("obstacle-settings").style.display = "none"
                if(this instanceof LightSource) {
                    selectedLight = this;
                    displayHTMLLightSettings()
                }
                else if(this instanceof Obstacle) {
                    selectedObstacle = this;
                    displayHTMLObstacleSettings()
                }
            }
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
    constructor(position, handleSize, lightSize, lightColor, rayCount, angleStart, angleEnd, intensity) {
        super(position, handleSize, true)
        
        this.angleStart = angleStart
        this.angleEnd = angleEnd
        this.rayCount = rayCount
        this.lightSize = lightSize
        this.lightColor = lightColor
        this.intensity = intensity
        this.populateRaysArray = function() {
            let array = []
            for(let i = 1; i <= this.rayCount; i++) {
                array.push(new Ray(this.position, this.lightSize, this.angleStart + (this.angleEnd-this.angleStart)/this.rayCount*i, 0.001))
            }
            return array
        }
        this.rays = this.populateRaysArray()
        this.drawHandle = function() {
            fill(255);
            if(selectedLight == this) {
                stroke(255,0,0)
                strokeWeight(2)
            }
            ellipse(this.position.x,this.position.y,handleSize.x,handleSize.y);
            noStroke()
        }
        this.checkRaysCollision = function() {
            this.rays.forEach(ray => {
                ray.checkCollision()
            });
        }
        this.drawShape = function() {
            let maxOpacity = 255
            let steps = 100
            let stepOpacity = maxOpacity/(steps * (steps + 1)/2)
            for(let i = 0; i < steps; i++) {
                let currentOpacity = (stepOpacity*i)*this.intensity;
                fill(color(red(this.lightColor),green(this.lightColor), blue(this.lightColor),currentOpacity))
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
        this.drawRays = function() {
            this.rays.forEach(ray => {
                ray.drawRayLine()
            });
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
    constructor(origin, length, rotation, collisionCheckFrequency) {
        this.origin = origin;
        this.length = length;
        this.rotation = rotation;
        this.collisionCheckFrequency = collisionCheckFrequency;
        this.targetPoint;
        this.collisionPoint;
        this.drawRayLine = function() {
            stroke(255,255,255,255)
            strokeWeight(1)
            line(this.origin.x, this.origin.y, this.collisionPoint.x, this.collisionPoint.y)
        }
        this.checkCollision = function() {
            this.targetPoint = createVector(this.origin.x + cos(this.rotation) * this.length, this.origin.y + sin(this.rotation) * this.length)
            for(let i = 0; i <= 1; i+= this.collisionCheckFrequency) {
                let lerpedPoint = p5.Vector.lerp(this.origin,this.targetPoint, i)
                if(pointInsideObstacle(lerpedPoint)) {
                    this.collisionPoint = lerpedPoint;
                    return;
                }
            }
            this.collisionPoint = this.targetPoint;
        }
        
    }
}
class Obstacle extends MoveAbleObject{
    constructor(position, size, obstacleColor, isEllipse) {
        super(position, size, isEllipse)
        this.obstacleColor = obstacleColor
        this.draw = function() {
            fill(this.obstacleColor)
            if(selectedObstacle == this) {
                stroke(255,0,0)
                strokeWeight(2)
            }
            if(this.isEllipse) {
                ellipse(this.position.x,this.position.y,size.x,size.y)
            }
            else {
            rect(this.position.x, this.position.y, this.size.x, this.size.y)
            }
            noStroke()
        }
        this.checkPointInside = function(point) {
            if(this.isEllipse) {
                let xDist = point.x - this.position.x
                let yDist = point.y - this.position.y
                return (xDist*xDist)/(this.size.x/2*this.size.x/2) + (yDist*yDist)/(this.size.y/2*this.size.y/2) < 1
            }
            return(point.x > this.position.x && point.x < this.position.x + this.size.x && point.y > this.position.y && point.y < this.position.y + this.size.y)
        }
    }
}

let selectedLight;
let lights = [];
let selectedObstacle;
let obstacles = []
let showRays = false
function setup() {
    noStroke()
    let canvasWidth = ((windowWidth/3)*2)
    let canvasHeight = ((windowHeight/3)*2)
    let cnv = createCanvas(canvasWidth, canvasHeight);
    cnv.position((windowWidth/6), (windowHeight/6));    
    angleMode(DEGREES)
    background(0);

    instantiateLight()
    instantiateObstacle()
    

    setupHTMLFunctions()
}

function setupHTMLFunctions() {
    select("#radius-input").input(function () {
        selectedLight.lightSize = this.value()
        for (let i = 0; i < selectedLight.rayCount; i++) {
            selectedLight.rays[i].length = this.value()
        }
    })
    select("#angle-input").input(function () {
        selectedLight.angleEnd = selectedLight.angleStart + Number(this.value())
        for (let i = 0; i < selectedLight.rayCount; i++) {
            selectedLight.rays[i].rotation = selectedLight.angleStart + (selectedLight.angleEnd - selectedLight.angleStart) / selectedLight.rayCount * i
        }
    })
    select("#rayCount-input").input(function () {
        selectedLight.rayCount = this.value()
        selectedLight.rays = []
        selectedLight.rays = selectedLight.populateRaysArray()
    })
    select("#light-color-input").input(function () {
        selectedLight.lightColor = color(this.value())
    })
    select("#intensity-input").input(function () {
        selectedLight.intensity = this.value()
    })
    select("#ellipse-input").input(function () {
        selectedObstacle.isEllipse = this.checked()
    })
    select("#obstacle-color-input").input(function () {
        selectedObstacle.obstacleColor = color(this.value())
    })

    select("#add-light").mousePressed(instantiateLight)
    select("#remove-light").mousePressed(removeLight)
    select("#add-obstacle").mousePressed(instantiateObstacle)
    select("#remove-obstacle").mousePressed(removeObstacle)
    select("#remove-all").mousePressed(removeAll)
    select("#show-rays").changed(function () {
        showRays = this.checked()
    })
    document.getElementById("light-settings").style.display = "none"
    document.getElementById("obstacle-settings").style.display = "none"
}

function displayHTMLLightSettings() {    
    document.getElementById("light-settings").style.display = "block"
    select("#radius-input").value(selectedLight.lightSize)
    select("#angle-input").value(selectedLight.angleEnd - selectedLight.angleStart)
    select("#rayCount-input").value(selectedLight.rayCount)

    let r = red(selectedLight.lightColor);
    let g = green(selectedLight.lightColor);
    let b = blue(selectedLight.lightColor);
    let hexColor = '#' + hex(r, 2) + hex(g, 2) + hex(b, 2);
    select("#light-color-input").value(hexColor);
}
function displayHTMLObstacleSettings() {
    document.getElementById("obstacle-settings").style.display = "block"
    let r = red(selectedObstacle.obstacleColor);
    let g = green(selectedObstacle.obstacleColor);
    let b = blue(selectedObstacle.obstacleColor);
    let hexColor = '#' + hex(r, 2) + hex(g, 2) + hex(b, 2);
    select("#obstacle-color-input").value(hexColor);
    select("#ellipse-input").checked(selectedObstacle.isEllipse)
}

function draw() {
    cursor(ARROW)
    background(0);
    
    blendMode(ADD)
    lights.forEach(light => {
        light.drawHandle()
        light.checkRaysCollision()
        if(showRays) {
            light.drawRays()
        }
        else {
            light.drawShape()
        }
    });
    blendMode(BLEND)
    obstacles.forEach(obstacle => {
        obstacle.draw()
    });
    handleObjectMovement()
    
}

function handleObjectMovement() {
    if(!cursorInCanvas()) {
        return
    }
    for(let i = lights.length-1; i >= 0; i--) {
        lights[i].move();
        if(lights[i].moving) {
            return;
        }
    }
    for(let i = obstacles.length-1; i >= 0; i--) {
        obstacles[i].resize()
        obstacles[i].move()
        if(obstacles[i].resizing || obstacles[i].moving) {
            return;
        }
    }
}
function instantiateLight() {
    let newPos = createVector(width/4, height/4)
    let newHandleSize = createVector(10,10)
    let newLightSize = 800
    let newLightColor = color(255)
    let newRayCount = 30
    let newAngleStart = 0
    let newAngleEnd = 45
    let newIntensity = 1
    newLight = new LightSource(newPos, newHandleSize, newLightSize, newLightColor, newRayCount, newAngleStart, newAngleEnd, newIntensity)
    lights.push(newLight)
    selectedLight = newLight
    displayHTMLLightSettings()
}

function instantiateObstacle() {
    let newPos = createVector(width/2, height/2)
    let newSize = createVector(100,100)
    let newColor = color(255)
    let newIsEllipse = false
    let newObstacle = new Obstacle(newPos, newSize, newColor, newIsEllipse)    
    obstacles.push(newObstacle)
    selectedObstacle = newObstacle
    displayHTMLObstacleSettings()
}

function removeLight() {
    if(selectedLight == undefined) {
        return
    }
    lights.splice(lights.indexOf(selectedLight),1)
    selectedLight = undefined
}

function removeObstacle() {
    if(selectedObstacle == undefined) {
        return
    }
    obstacles.splice(obstacles.indexOf(selectedObstacle),1)
    selectedObstacle = undefined
}

function removeAll() {
    lights = []
    obstacles = []
}

function pointInsideObstacle(point) {
    for(let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i]
        if(obstacle.checkPointInside(point)) {
            return true
        }
    }
}

function mousePressed() {
    obstacles.forEach(obstacle => {
        obstacle.mousePressed()
    });
    lights.forEach(light => {
        light.mousePressed()
    });
}
function mouseReleased() {
    obstacles.forEach(obstacle => {
        obstacle.moving = false
        obstacle.resizing = false
    });
    lights.forEach(light => {
        light.moving = false
    });
}
function mouseWheel(event)
{
    if(!cursorInCanvas()) {
        return
    }
    selectedLight.spin(event.delta/20)
}
function cursorInCanvas() {
    return(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height)
}

