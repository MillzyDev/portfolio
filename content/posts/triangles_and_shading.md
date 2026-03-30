+++
title = "Triangles & Shaders"
date = 2026-03-30
description = "Drawing something to a window, and looking over the shader pipeline."

[taxonomies]
tags=["C", "Graphics", "OpenGL"]
series=["Learning OpenGL"]
+++

# OpenGL's Graphics Pipeline

In my last post, I created a small project and got a blank window to show up. Throughout that whole process, the only real OpenGL function we used was `glViewport` to handle resizing the space that OpenGL can render to. Today I plan on doing some actual rendering, by getting a triangle on the screen.

OpenGL has 6 main stages in its main graphics pipeline:
1. Vertex Shading
2. Geometry Shading
3. Shape Assembly
4. Rasterization
5. Fragment Shading
6. Tests and Blending

![Learn OpenGL's diagram for OpenGL's graphics pipeline](https://learnopengl.com/img/getting-started/pipeline.png)

> Image Source: [leanopengl.com](https://learnopengl.com/Getting-started/Hello-Triangle)

I'm not going to talk about what each stage does since it's explained in pretty good detail on [learnopengl.com](https://learnopengl.com/Getting-started/Hello-Triangle).
Each part in this pipeline is a step to turn vertex data into a pixel in our window.
We're able to program the Vertex Shading, Geometry Shading and Fragment shading parts of this process. However, only Vertex Shading and Fragment Shading are required. 

# Window Buffer
Before rendering our first shape, one more thing that I forgot to do in my last post. Learn OpenGL shows how to set the window background colour to be something other than black, so that's what I'm going to do here. It only takes 2 calls in the main render loop.
```c,linenos,linenostart=34
while (!glfwWindowShouldClose(window)) {
    glClearColor(0.106f, 0.035f, 0.122f, 1.0f); // Sets colour to clear buffer with
    glClear(GL_COLOR_BUFFER_BIT); // Clears buffer with last set colour

    glfwSwapBuffers(window);
    glfwPollEvents();
}
```
We now have our window looking like this:
![Window now with a dark purple background](/images/learning-opengl_20260330_130914.avif)

# Vertex Data
First step is defining the vertices of the triangle, the coordinates of which are 3D and each axis ranges between -1.0 and 1.0. These coordinates are "normalized device coordinates". Anything outside of that range is simply not rendered to the screen. The screenspace coordinates are then achieved by transforming the normalized device coordinates using the values set with `glViewport`.
```c,linenos,linenostart=15
float32 vertices[] = {
    -0.5f, -0.5f, 0.0f,
     0.5f, -0.5f, 0.0f,
     0.0f,  0.5f, 0.0f,
};
```

This data is send to the first stage in the graphics pipeline, the vertex shader. Since the vertex shader runs on the GPU, we need to first allocate GPU memory in which to store out vertices.
```c,linenos,linenostart=44
uint32 vertexBufferObject;
glGenBuffers(1, &vertexBufferObject);
```
This doesn't strictly allocate the memory, creates a buffer object and an identifier for a single buffer that we store in `vertexBufferObject`.

Next is to move our vertex data into the buffer object. To do that we first need to bind the buffer, so that we can operate on it, and then we can move the data to it. Since we are only trying to draw a static triangle, we can do this outside of the main render loop and also provide a usage hint that its a static drawing.
```c,linenos,linenostart=47
glBindBuffer(GL_ARRAY_BUFFER, vertexBufferObject);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
```

# Shading
## Vertex Shader
To actually render our triangle, we need to create a vertex and fragment shader. Our vertex shader can be simple, and just re-emit the coordinates given. Shaders are written in GLSL, and the vertex shader I will use looks like this:
```glsl
#version 330 core
layout(location = 0) in vec3 aPos; // location important for later

void main() {
    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
}
```
Since I'm only learning here, I'll be embedding the shader source into my actual source file as a string literal. Of course in a practical environment I'd write some asset system, which I may do later.
```c,linenos,linenostart=14
const int8 *vertexShaderSrc =
    "#version 330 core\n"
    "layout(location = 0) in vec3 aPos;\n"
    "\n"
    "void main() {\n"
    "    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);\n"
    "}\0";
```
Similar to the buffer object previously declared, shaders also get given an ID. And then using this shader source we can compile it.
```cpp,linenos,linenostart=50
uint32 vertexShader = glCreateShader(GL_VERTEX_SHADER);
glShaderSource(vertexShader, 1, &vertexShaderSrc, nullptr); // null terminated, no length needed
glCompileShader(vertexShader);
```
Of cource, shader compilation can fail, so we should appropriately check that compilation succeeds and report any errors.
```cpp,linenos,linenostart=54
{
    int32 success;
    int8 infoLog[512];
    glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(vertexShader, 512, nullptr, infoLog);
        fprintf(stderr, "Vertex shader compilation failed.\n%s", infoLog);
        return -1;
    }
}
```

## Fragment Shader
The process for setting up and compiling the fragment shader is largely the same. As for the actual shader we specify a colour for the end pixel to be.
```glsl
#version 330 core
out vec4 FragColor;

void main() {
    FragColor = vec4(0.941, 0.973, 1.0, 1.0);
}
```
Super simple, we're just setting the fragment's colour to be a slightly off-white. As previously, the compilation is largely the same, except we specify this is a fragment shader.
```c,linenos,linenostart=72
uint32 fragShader = glCreateShader(GL_FRAGMENT_SHADER);
glShaderSource(fragShader, 1, &fragShaderSrc, nullptr);
glCompileShader(fragShader);
{
    int32 success;
    int8 infoLog[512];
    glGetShaderiv(fragShader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(fragShader, 512, nullptr, infoLog);
        fprintf(stderr, "Fragment shader compilation failed.\n%s", infoLog);
        return -1;
    }
}
```
## Shader Program
Now that we've compiled the shaders, they can be used to construct a shader program. This is the part that we will actually set what series of shaders are used to render the triangle. As with almost everything before, we need and ID for it. We can then easily add our compiled shaders, and then link them.
```c,linenos,linenostart=86
int32 shaderProgram = glCreateProgram();
glAttachShader(shaderProgram, vertexShader);
glAttachShader(shaderProgram, fragShader);
glLinkProgram(shaderProgram);
```
This stage can fail as well, check and log for any errors:
```cpp,linenos,linenostart=90
{
    int32 success;
    int8 infoLog[512];
    glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
    if (!success) {
        glGetProgramInfoLog(shaderProgram, 512, nullptr, infoLog);
        fprintf(stderr, "Shader program link failed.\n%s", infoLog);
        return -1;
    }
}
```
Now that we have a linked shader program, we can safely dispose of the shaders.

```c,linenos,linenostart=101
glDeleteShader(vertexShader);
glDeleteShader(fragShader);
```

# Drawing A Triangle
We should be just a few steps from drawing our triangle now. In our main render loop, we need to tell OpenGL to use our shader program. Afterwards we need to link up the vertex attributes so OpenGL knows how to interpret the data we provide the shaders. This is where the `location` attribute in our vertex shader is used.

Telling OpenGL to use our shader program is just a single function call in our render loop.
```c,linenos,linenostart=111,hl_lines=5
while (!glfwWindowShouldClose(window)) {
    glClearColor(0.106f, 0.035f, 0.122f, 1.0f); // Sets colour to clear buffer with
    glClear(GL_COLOR_BUFFER_BIT); // Clears buffer with last set colour
        
    glUseProgram(shaderProgram);

    glfwSwapBuffers(window);
    glfwPollEvents();
}
```

Next, configuring the vertex attributes, which we do immediately outside of the render loop, before we enter it.
```c,linenos,linenostart=111
// First arg pertains to the location set in the shader, thats where the coords are going.
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float32), nullptr);
glEnableVertexAttribArray(0);
```

## Vertex Array Object
The last thing we need to declare is the vertex array object, it can be thought of as like a map as to where all the data being bound ends up. It's quite tricky to explain for me, but that's about the best I can summarise at the moment.

![Explanation diagram](https://learnopengl.com/img/getting-started/vertex_array_objects.png)
> Image Source: [Learn OpenGL](https://learnopengl.com/Getting-started/Hello-Triangle)

We can create the vertext array object (VAO) similarly to how we made the vertex buffer object, and then bind it so it is properly associated with the VBO when we bind the data afterwards.
```c,linenos,linenostart=108
glGenVertexArrays(1, &vertexArrayObject);

glBindVertexArray(vertexArrayObject);
```

Then before the render loop, for extra safety, we can unbind the VBO and VAO so its not accidentally modified. This shouldn't happen to be clear, but doesnt hurt to add some railings to our catwalks.
```c,linenos,linenostart=120
glBindBuffer(GL_ARRAY_BUFFER, 0);
glBindVertexArray(0);
```

## The Moment You've Been Waiting For
We can now FINALLY draw our triangle, we've already set the shader program to use, now we bind our VAO (again, since we unbound it) and make our draw call.
```c,linenos,linestart=123,hl_lines=6-7
while (!glfwWindowShouldClose(window)) {
    glClearColor(0.106f, 0.035f, 0.122f, 1.0f); // Sets colour to clear buffer with
    glClear(GL_COLOR_BUFFER_BIT); // Clears buffer with last set colour

    glUseProgram(shaderProgram);
    glBindVertexArray(vertexArrayObject);
    glDrawArrays(GL_TRIANGLES, 0, 3);

    glfwSwapBuffers(window);
    glfwPollEvents();
}
```
And here is what we get!

![Our rendered triangle!!!](/images/learning-opengl_20260330_220158.avif)