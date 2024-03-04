// glslify blows up unless first line is comment or empty
// CC_Texture0 is depth map for z sorting
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float u_radius;
uniform float u_refraction;
uniform float u_reflection;
uniform float u_fresnelBias;
uniform float u_amplitude;
uniform float u_time;
uniform float u_frequency;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
varying float v_resolutionRatio;
varying float v_depthRange;


#define EYE normalize(vec3(0.5))

vec4 getDistortionColor(in sampler2D refractMap, in vec2 screenCoord, in float distortionAlpha, in vec3 refractNormal, in vec3 reflectNormal, in float fresnelBias, in float refractFactor, in float reflectFactor, in float noiseFactor, in float expandOffset) {

	// factors
  refractFactor *= noiseFactor;
  reflectFactor *= noiseFactor;

	// intensity

  float intensity = distortionAlpha * 0.2 + noiseFactor * ceil(distortionAlpha) * 0.05;
  //float intensity = pow(normalPacked.a, 3.0) * 0.35;

	// fresnel

  float NdotI = dot(refractNormal, EYE);
  float fresnel = getFresnel(NdotI, fresnelBias, 5.0);
  float reflectBias = fresnel;
  float refractBias = 1.0 - fresnel;

  // refraction

  vec3 refractionColor = getRefractionColor(refractMap, screenCoord, refractNormal, refractFactor, refractBias, expandOffset);

  // reflection

  vec3 reflectionColor = getReflectionColor(refractMap, reflectNormal, EYE, NdotI);

  // blend reflection and refraction

  return vec4(refractionColor * refractBias + reflectionColor * reflectBias + vec3(intensity, intensity, intensity), distortionAlpha);
}


float getUnpackedDepth(in vec4 packedDepth) {
  const vec4 BIT_SHIFT = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
  return dot(packedDepth, BIT_SHIFT);
}

bool getDepthTestFailed(in sampler2D depthMap, in vec2 screenTexCoord, in float depth) {
  vec4 packedScreenDepth = texture2D(depthMap, screenTexCoord);
  float screenDepth = getUnpackedDepth(packedScreenDepth);
  return screenDepth < depth;
}

float getHash(in vec2 coord) {
  return fract(sin(dot(coord, vec2(234.1235, 123.752))) * 34702.0);
}

float getNoise(in vec2 coord) {
  vec2 coordWhole = floor(coord);
  vec2 coordFraction = fract(coord);
  vec2 smoothFraction = coordFraction * coordFraction * (3.0 - 2.0 * coordFraction);

  float bl = getHash(coordWhole);
  float br = getHash(vec2(coordWhole.x + 1.0, coordWhole.y));
  float tl = getHash(vec2(coordWhole.x, coordWhole.y + 1.0));
  float tr = getHash(vec2(coordWhole.x + 1.0, coordWhole.y + 1.0));
  float b = mix(bl, br, smoothFraction.x);
  float t = mix(tl, tr, smoothFraction.x);

  return mix(b, t, smoothFraction.y);
}

float getNoiseFBM(in vec2 coord, in float time, in float frequency, in float amplitude) {
  float fractalSum = 0.0;

  time = time * 3.141592653589793 * 2.0 + 3.141592653589793;

	// fractional brownian motion
  for (int i = 0; i < 2; i++) {
    vec2 offset = vec2(cos(time + frequency), sin(time + frequency)) * (frequency * 0.1);
    float noise = getNoise(coord * frequency + offset);
    fractalSum += noise * amplitude;
    amplitude *= .5;
    frequency *= 2.0;
  }

  return fractalSum;
}

#pragma glslify: export(getNoiseFBM)

void main() {
  vec2 screenTexCoord = vTextureCoord;

	
	// factors
  float refractionFactor = u_refraction;
  float reflectionFactor = u_reflection;

	// normals
  screenTexCoord.x *= v_resolutionRatio;
  vec2 coordDiff = vec2(0.5) - v_texCoord;
  float coordDist = length(coordDiff);
  float expCoordDist = pow(coordDist * 2.0, 2.0);
  float distortionAlpha = 1.0 - expCoordDist;
  float normalZ = distortionAlpha * 0.5;
  float intensity = max(1.0, 1.0 / max(expCoordDist * 5.0, 0.1));

  vec2 distortionDir = -(coordDiff / expCoordDist);
  vec3 refractNormal = normalize(vec3(distortionDir.x * refractionFactor, distortionDir.y * refractionFactor, normalZ));
  vec3 reflectNormal = normalize(vec3(distortionDir.x * reflectionFactor, distortionDir.y * reflectionFactor, normalZ));

	// generate spin
  float angle = atan(coordDiff.y, coordDiff.x) / 3.141592653589793;
  vec2 spinA = vec2(cos(3.141592653589793 * 2.0 * (coordDist + angle + u_time * 0.1)), sin(3.141592653589793 * 2.0 * (coordDist * 0.5 + angle - u_time * 0.1)));
  vec2 spinB = vec2(cos(3.141592653589793 * 2.0 * (coordDist + angle + u_time * 0.15)), sin(3.141592653589793 * 2.0 * (coordDist * 0.5 + angle - u_time * 0.15)));

	// noise

  float noiseDust = getNoiseFBM(screenTexCoord, -u_time * 0.5, u_frequency * (1.0 - coordDist * 0.5), u_amplitude);
  noiseDust = 1.0 - noiseDust;

  float noiseParticlesA = getNoiseFBM(spinA, 0.0, u_frequency * 3.0, u_amplitude * 2.0);
  noiseParticlesA = 1.0 - smoothstep(0.2, 0.4, noiseParticlesA);

  float noiseParticlesB = getNoiseFBM(spinB, 0.0, u_frequency * 4.0, u_amplitude * 3.0);
  noiseParticlesB = 1.0 - smoothstep(0.2, 0.4, noiseParticlesB);

  float noiseParticles = noiseParticlesA + noiseParticlesB;
  float noise = noiseDust + noiseParticles;

	// distortion
  vec2 distortionCoord = screenTexCoord + spinA * 0.5 * u_amplitude;
  vec4 distortionColor = getDistortionColor(u_refractMap, distortionCoord, distortionAlpha, refractNormal, reflectNormal, u_fresnelBias, refractionFactor, reflectionFactor, noise, normalZ);

  // composite

  gl_FragColor = v_fragmentColor * vec4(distortionColor.rgb * intensity, noise * distortionAlpha * intensity);
}