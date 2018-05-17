/*============================================================*/
/*=====================Pixel accessing========================*/
/*============================================================*/
// get a single pixel using just one index
function getPixel1(image, x) {
	var data = image.data;
	return [data[x], data[x+1], data[x+2], data[x+3]];
}

// get a pixel using row (y) and col (x) of picture
function getPixel(image, x, y) {
	var data = image.data;
	var i = y*(image.width*4) + (x * 4); // index calculation
	return [data[i], data[i+1], data[i+2], data[i+3]];
}

// set a single pixel
function setPixel1(image, pixel, x) {
	var data = image.data;
	
	data[x] = pixel[0];
	data[x+1] = pixel[1];
	data[x+2] = pixel[2];
	data[x+3] = pixel[3];
}

// set a pixel using row (y) and col (x) of picture
function setPixel(image, pixel, x, y) {
	var data = image.data;
	var i = y*(image.width*4) + (x * 4); // index calculation
	
	data[i] = pixel[0];
	data[i+1] = pixel[1];
	data[i+2] = pixel[2];
	data[i+3] = pixel[3];
}

/*============================================================*/
/*=====================Pixel Arithmetic=======================*/
/*============================================================*/
// subtract two pixels
function minus(p1, p2) {
	return [p1[0]-p2[0], p1[1]-p2[1], p1[2]-p2[2], p1[3]];
}

// add two pixels
function add(p1, p2) {
	return [p1[0]+p2[0], p1[1]+p2[1], p1[2]+p2[2], p1[3]];
}

// multiply some scalar
function mult(p1, s) {
	return [p1[0]*s, p1[1]*s, p1[2]*s, p1[3]];
}

// function for clamping rgb values
function clamp(val, min, max) {
  return val < min ? min : (val > max ? max : val);
}

// point sampling
function samplePixel( image, x, y ) {
    y = Math.max( 0, Math.min(Math.round(y), image.height- 1) );
    x = Math.max( 0, Math.min(Math.round(x), image.width - 1) );
    return getPixel(image, x, y);
}

/*============================================================*/
/*==========================Filters===========================*/
/*============================================================*/
// make the canvas grayscale
function grayscaleCanvas(image) {
	for (var x = 0; x < image.data.length; x+=4) {
	    var pixel = getPixel1(image, x);

	    var luminance = 0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2];
	    pixel[0] = luminance;
	    pixel[1] = luminance;
	    pixel[2] = luminance;

	    setPixel1(image, pixel, x);
	}
	return image;
}

// rotate the canvas
function rotateCanvas( image, imageCopy, radians ) {
  	var cos = Math.cos(-radians);
  	var sin = Math.sin(-radians);
  	// set new origin
  	var x0 = image.height/2.;
  	var y0 = image.width/2.;
  	for (var y = 0; y < image.height; y++) {
    	for (var x = 0; x < image.width; x++) {
      		var x1 = x - x0;
      		var y1 = y - y0;
      		var u = x0 + x1 * cos - y1 * sin;
      		var v = y0 + x1 * sin + y1 * cos;
      		var pixel = samplePixel(image, u, v);
        	setPixel(imageCopy, pixel, x, y);
      	}
    }
  	return imageCopy;
}

// swirl the canvas
function swirlCanvas( image, imageCopy, radians ) {
  	// get the center
  	var xCenter = image.width/2;
  	var yCenter = image.height/2;
  	for (var y = 0; y < image.height; y++) {
    	for (var x = 0; x < image.width; x++) {
      		var dx = x - xCenter;
      		var dy = y - yCenter;
      		var r = Math.sqrt(dx * dx + dy * dy);
      		var theta =  radians * r / 256;
      		var u = dx * Math.cos(theta) - dy * Math.sin(theta) + xCenter;
      		var v = dx * Math.sin(theta) + dy * Math.cos(theta) + yCenter;
      		var pixel = samplePixel(image, u, v);
      		setPixel(imageCopy, pixel, x, y); 
    	}
  	}
  	return imageCopy;
}
// Change the brightness of the canvas
function brightCanvas( image ) {
  	var alpha, dirLuminance;
  	var ratio = 0.95; // set to 0.95
  	if (ratio < 0.0) {
    	alpha = 1 + ratio;
    	dirLuminance = 0;   // blend with black
  	} else {
    	alpha = 1 - ratio;
    	dirLuminance = 1; // blend with white
  	}

  	for (var x = 0; x < image.width; x++) {
    	for (var y = 0; y < image.height; y++) {
      	var pixel = getPixel(image, x, y);

      	pixel[0] = (alpha * pixel[0]/255. + (1-alpha) * dirLuminance)*255;
      	pixel[1] = (alpha * pixel[1]/255. + (1-alpha) * dirLuminance)*255;
      	pixel[2] = (alpha * pixel[2]/255. + (1-alpha) * dirLuminance)*255;

      	setPixel(image, pixel, x, y);
    	}
  	}

  	return image;
}

function contrastCanvas(image) {
	// Reference: https://en.wikipedia.org/wiki/Image_editing#Contrast_change_and_brightening
	var ratio = -0.98 // ratio set to -0.98
  	var contrastGIMP = Math.tan((ratio+1) * Math.PI / 4);
  	for (var y = 0; y < image.height; y++) {
    	for (var x = 0; x < image.width; x++) {
      		var pixel = getPixel(image, x, y);

      		// GNU Image Manipulation Program uses this formula
      		// clamp to restrict to 0 and 1
      		pixel[0] = ((pixel[0]/255.-0.5) * contrastGIMP + 0.5)*255;
      		pixel[1] = ((pixel[1]/255.-0.5) * contrastGIMP + 0.5)*255;
      		pixel[2] = ((pixel[2]/255.-0.5) * contrastGIMP + 0.5)*255;

      		setPixel(image, pixel, x, y);
    	}
  	}
  	return image;
}

// add a vignette to the canvas
function vignetteCanvas(image) {
	var innerR = 0.1;
	var outerR = 0.7;
	var centerX = image.width / 2;
  	// hold onto the center of the image (y)
  	var centerY = image.height / 2;
  	// hold onto the distance between innerR and outerR
  	var innerDist = innerR * Math.sqrt(centerX*centerX + centerY*centerY);
  	var outerDist = outerR * Math.sqrt(centerX*centerX + centerY*centerY);
  	var deltaDist = outerDist - innerDist;

  	for (var y = 0; y < image.height; y++) {
    	for (var x = 0; x < image.width; x++) {
      		var pixel = getPixel(image, x, y);
      		var dist = Math.sqrt((x-centerX)*(x-centerX) + (y-centerY)*(y-centerY));
      		// the case when the pixel is outside the range
      		if (dist >= outerDist)
        		pixel = [0, 0, 0, pixel[3]];

      		// the case when the pixel is between the two circles
      		else if (dist >= innerR) {
        		pixel[0] = pixel[0]*(1-(dist-innerDist)/deltaDist);
        		pixel[1] = pixel[1]*(1-(dist-innerDist)/deltaDist);
        		pixel[2] = pixel[2]*(1-(dist-innerDist)/deltaDist);
      		}

      		setPixel(image, pixel, x, y);
    	}
  	}
  	return image;
}

// add a vignette to the canvas
function followVignetteCanvas(image, player) {
	var innerR = 0.05;
	var outerR = 0.2;
	var centerX = image.width / 2;
  	// hold onto the center of the image (y)
  	var centerY = image.width / 2;

  	// hold onto the distance between innerR and outerR
  	var innerDist = innerR * Math.sqrt(centerX*centerX + centerY*centerY);
  	var outerDist = outerR * Math.sqrt(centerX*centerX + centerY*centerY);
  	var deltaDist = outerDist - innerDist;

  	for (var y = 0; y < image.height; y++) {
    	for (var x = 0; x < image.width; x++) {
      		var pixel = getPixel(image, x, y);
      		var dist = Math.sqrt((x-player.x)*(x-player.x) + (y-player.y)*(y-player.y));
      		// the case when the pixel is outside the range
      		if (dist >= outerDist)
        		pixel = [0, 0, 0, pixel[3]];

      		// the case when the pixel is between the two circles
      		else if (dist >= innerR) {
        		pixel[0] = pixel[0]*(1-(dist-innerDist)/deltaDist);
        		pixel[1] = pixel[1]*(1-(dist-innerDist)/deltaDist);
        		pixel[2] = pixel[2]*(1-(dist-innerDist)/deltaDist);
      		}

      		setPixel(image, pixel, x, y);
    	}
  	}
  	return image;
}


/*============================================================*/
/*=====================Call from Index========================*/
/*============================================================*/
// add some convolution, depending on the number passed (not yet complete)
function applyConvolutions(image, convList, imageCopy, player) {
	var newImage = image;
  for (var i = 0; i < convList.length; i++) {
    var num = convList[i];
  	if (num === 1)
  		newImage = grayscaleCanvas(newImage);
  	if (num === 2)
  		newImage = rotateCanvas(newImage, imageCopy, Math.PI*1/2.);
  	if (num === 3)
  		newImage = rotateCanvas(newImage, imageCopy, Math.PI);
  	if (num === 4)
  		newImage = rotateCanvas(newImage, imageCopy, Math.PI*3/2.);
  	if (num === 5)
  		newImage = swirlCanvas(newImage, imageCopy, Math.PI*3/4.);
  	if (num === 6)
  		newImage = brightCanvas(newImage);
  	if (num === 7)
  		newImage = contrastCanvas(newImage);
  	if (num === 8)
  		newImage = vignetteCanvas(newImage);
  	if (num === 9)
  		newImage = followVignetteCanvas(newImage, player);
  }

	return newImage;
}