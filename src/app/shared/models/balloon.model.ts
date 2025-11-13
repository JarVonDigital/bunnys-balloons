export interface BalloonConfig {
  /**
   * Stable id used for ngFor trackBy and debugging.
   */
  id: string;
  /**
   * CSS gradient or color value used as the balloon fill.
   */
  gradient: string;
  width?: number;
  height?: number;
  translateX?: number;
  translateY?: number;
  zIndex?: number;
  stringLength?: number;
  /**
   * Degrees of curvature applied to the animated string segments.
   */
  stringBend?: number;
  /**
   * Horizontal sway, in pixels, applied to the string physics animation.
   */
  stringWaveAmplitude?: number;
  /**
   * Duration, in seconds, for a full string sway cycle.
   */
  stringWaveDuration?: number;
  /**
   * Phase offset, in seconds, so strings don't animate in sync.
   */
  stringWaveDelay?: number;
  /**
   * Optional override for the JSON animation used to draw the string.
   */
  stringAnimationPath?: string;
  /**
   * Maximum number of pixels the balloon should float vertically when scrolling.
   */
  floatRange?: number;
  /**
   * Maximum number of pixels the balloon should drift horizontally when scrolling.
   */
  horizontalDrift?: number;
  /**
   * Maximum rotation applied during the scroll parallax effect.
   */
  rotationRange?: number;
}
