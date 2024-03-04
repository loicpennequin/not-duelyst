// pixi provided uniforms
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float time;



float Alpha_Percent = 100.0;
float Amount = 0.03;
float Scale = 5.1;
bool Animate;
bool Horizontal_Border;
float Border_Offset = 1.1;
vec4 Border_Color = vec4(.8, .5, 1.0, 1.0);

float rand(vec2 co) {
  float scale = Scale;
//	if (Animate)
//		scale *= rand_f;
  vec2 v1 = vec2(92.0, 80.0);
  vec2 v2 = vec2(41.0, 62.0);
  return fract(sin(dot(co.xy, v1)) + cos(dot(co.xy, v2)) * scale);
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  vec2 uv = vTextureCoord;

  vec4 rgba = texture2D(uSampler, vTextureCoord);
  vec3 tc = rgba.rgb * Border_Color.rgb;

  float uv_compare = uv.y;

  if (uv_compare < (Border_Offset - 0.8)) {
    vec2 randv = vec2(rand(uv.yx), rand(uv.yx));
    tc = texture2D(uSampler, uv + (randv * Amount)).rgb;
  } else if (uv_compare >= (Border_Offset + 0.005)) {
    tc = rgba.rgb;
  }

  if (rgba.a == 0.0) {
    gl_FragColor = rgba;
  } else {

    vec4 fx = mix(rgba, vec4(tc, 1.0), (Alpha_Percent * 0.01));
    vec4 mixRatio = vec4(0.7, 0.65, 0.4, 1.0);
    gl_FragColor = mix(fx, rgba, mixRatio);
  }

}