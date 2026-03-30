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
float vertices[] = {
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
glBufferData(vertexBufferObject, sizeof(vertices), vertices, GL_STATIC_DRAW);
```

# Shading
To actually render our triangle, we need to create a vertex and fragment shader. Our vertext shader can be simple, and just re-emit the coordinates given. Shaders are written in GLSL, and the vertex shader I will use looks like this:
```glsl
#version 330 core
layout(location = 0) in vec3 aPos;

void main() {
    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
}
```
Since I'm only learning here, I'll be embedding the shader source into my actual source file as a string literal. Of course in a practical environment I'd write some asset system, which I may do later.
```c,linenos,linenostart=14
const char *vertexShaderSrc =
    "#version 330 core\n"
    "void main() {\n"
    "    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);\n"
    "}\0";
```
Similar to the buffer object previously declared, shaders also get given an ID. And then using this shader source we can compile it.
```c,linenos,linenostart=50
uint32 vertexShader = glCreateShader(GL_VERTEX_SHADER);
glShaderSource(vertexShader, 1, &vertexShaderSrc, nullptr); // null terminated, no length needed
glCompileShader(vertexShader);
```