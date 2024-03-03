varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
  vec4 foo = texture2D(uSampler, vTextureCoord);

  gl_FragColor = texture2D(uSampler, vTextureCoord);

}