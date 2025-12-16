// Iridescence / Liquid Fluid Shader
// Adapted for Vanilla JS from ReactBits/GLSL concepts

const canvas = document.getElementById('hero-canvas');
const gl = canvas.getContext('webgl');

let time = 0.0;
let program;

// Vertex Shader: Simple full-screen quad
const vertexSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

// Fragment Shader: Fluid Domain Warping
const fragmentSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    
    // Noise functions
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        
        // Correct Aspect Ratio to prevent stretching
        float aspect = resolution.x / resolution.y;
        vec2 coord = uv;
        coord.x *= aspect;

        float t = time * 0.15; // Animation Speed
        
        // Fluid Domain Warping
        // We distort the coordinate space multiple times using noise
        
        // Layer 1
        vec2 q = vec2(0.);
        q.x = snoise(coord + vec2(0.0, t*0.5));
        q.y = snoise(coord + vec2(1.0, t*0.3));

        // Layer 2
        vec2 r = vec2(0.);
        r.x = snoise(coord + 1.0*q + vec2(1.7, 9.2) + 0.15*t);
        r.y = snoise(coord + 1.0*q + vec2(8.3, 2.8) + 0.126*t);

        // Final Noise Value
        float f = snoise(coord + r);

        // Color Mixing
        // We mix 3 colors based on the distorted noise value
        // Color Palette: Deep Blue, Purple, Cyan/Pink accents
        
        vec3 color1 = vec3(0.05, 0.09, 0.16); // Dark Slate (Background)
        vec3 color2 = vec3(0.05, 0.5, 0.9);   // Brand Blue
        vec3 color3 = vec3(0.6, 0.1, 0.6);    // Purple/Pink

        // Mix based on 'f' (noise) and 'r.x' (distortion)
        vec3 color = mix(color1, color2, clamp((f*f)*4.0, 0.0, 1.0));
        color = mix(color, color3, clamp(length(q), 0.0, 1.0));
        
        // Add subtle highlights
        color = mix(color, vec3(0.9, 0.9, 1.0), clamp(length(r.x), 0.0, 1.0) * 0.2);

        gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color, 1.0);
        
        // Slight Vignette for depth
        float dist = distance(uv, vec2(0.5));
        gl_FragColor.rgb *= smoothstep(1.2, 0.2, dist);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function init() {
    if (!gl) return;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return;
    }

    // Set up full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
    ]), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(render);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; // Full screen or section height
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function render(timestamp) {
    time = timestamp * 0.001; // Seconds

    gl.useProgram(program);

    // Uniforms
    const resolutionLocation = gl.getUniformLocation(program, "resolution");
    const timeLocation = gl.getUniformLocation(program, "time");

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, time);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}

document.addEventListener('DOMContentLoaded', init);