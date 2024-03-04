// pixi provided uniforms
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float time;
uniform vec2 speed;
uniform float shift;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float rand(vec2 n) {
  //This is just a compounded expression to simulate a random number based on a seed given as n
  return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 n) {
  //Uses the rand function to generate noise
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float fbm(vec2 n) {
  //fbm stands for "Fractal Brownian Motion" https://en.wikipedia.org/wiki/Fractional_Brownian_motion
  float total = 0.0, amplitude = 1.0;
  for (int i = 0; i < 4; i++) {
    total += noise(n) * amplitude;
    n += n;
    amplitude *= 0.5;
  }
  return total;
}

void main() {
    //This is where our shader comes together
  const vec3 c1 = vec3(156.0 / 255.0, 10.0 / 255.0, 0.0 / 255.0);
  const vec3 c2 = vec3(255.0 / 255.0, 80.4 / 255.0, 0.4 / 255.0);
  const vec3 c3 = vec3(3.0, 2.5, 0.0);
  const vec3 c4 = vec3(240.0 / 255.0, 150.0 / 255.0, 150.0 / 255.0);
  const vec3 c5 = vec3(0.1);
  const vec3 c6 = vec3(0.9);

  vec2 p = vec2(15.0) * vTextureCoord;

  float q = fbm(p - time * 0.1);
  vec2 r = vec2(fbm(p + q + time * speed.x - p.x - p.y), fbm(p + q - time * speed.y));
  vec3 c = mix(c1, c2, fbm(p + r)) + mix(c3, c4, r.x) - mix(c5, c6, r.y);
  float grad = vTextureCoord.y;

  vec4 original = texture2D(uSampler, vTextureCoord);

  if (original.a == 0.0) {
    gl_FragColor = original;
  } else {
    // gl_FragColor = original;
    // gl_FragColor.r = time;
    vec4 flame = vec4(c * cos(shift * vTextureCoord.y), 1.0);
    float a = sin(time * 1.5);
    vec4 mixRatio = vec4(map(a, 0.0, 1.0, 0.7, 0.5), map(a, 0.0, 1.0, 0.9, 0.85), map(a, 0.0, 1.0, 1.0, 0.92), 1.0);

    gl_FragColor = mix(flame, original, mixRatio);
    gl_FragColor.xyz *= 1.0 - grad;
  }
}