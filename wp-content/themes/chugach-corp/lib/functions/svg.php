<?php

function get_svg( $type = '' ) {
	
	$svgs = array(  
    
    'hero-bottom' => '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="128">
  <path d="M1441 128.043v-.021h-.055c.019.006.037.014.055.021z"/>
  <path fill="#FFF" d="M505.316 69.838C423.074 77.531 254.635 85.154 0 92.711v35.311h1440.945c-82.925-33.224-189.941-59.059-321.051-77.506C923.188 22.84 628.68 58.299 505.316 69.838z"/>
  <path fill="#D7D5D5" d="M1440 128.043c-82.933-33.234-189.968-59.076-321.105-77.527C922.188 22.84 627.68 58.299 504.316 69.838 422.074 77.531 253.635 85.154-1 92.711V75.809c154.096 5.293 254.165 6.469 300.207 3.525 235.334-10.887 341.722-32.459 377.398-38.701C895.762 3.377 1119.095.746 1191 .746c92.023 0 175.023 4.143 249 12.43v114.867z"/>
</svg>',
    
        'play-white' => '<svg height="63" viewBox="0 0 63 63" width="63" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#fff" stroke-width="3" transform="translate(2 2)"><circle cx="29.5" cy="29.5" r="29.5"/><path d="m48.354102 30-28.854102 14.427051v-28.854102z" stroke-linecap="square" stroke-linejoin="round"/></g></svg>',   
        
        'play-hero' => '<svg height="103" viewBox="0 0 103 103" width="103" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" transform="translate(9 9)"><circle cx="43" cy="43" fill="#ffa300" r="35"/><circle cx="43" cy="43" opacity=".6" r="39" stroke="#fff" stroke-width="8"/><circle cx="42.5" cy="42.5" opacity=".3" r="47" stroke="#fff" stroke-width="9"/><path d="m61 42-28 14v-28z" fill="#fff"/></g></svg>',   
        
        'play-video' => '<svg height="103" viewBox="0 0 103 103" width="103" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" transform="translate(9 9)"><circle cx="43" cy="43" fill="#ffa300" r="35"/><circle cx="43" cy="43" opacity=".6" r="39" stroke="#fff" stroke-width="8"/><circle cx="42.5" cy="42.5" opacity=".3" r="47" stroke="#fff" stroke-width="9"/><path d="m61 42-28 14v-28z" fill="#fff"/></g></svg>',     
                                                    
        'arrow-left' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 22"><g fill="none" fill-rule="evenodd"><path class="arrow" 
        fill="#007ABE" d="M13 0a1 1 0 0 0-2 0L0 10a1 1 0 0 0 0 2l11 10h2v-2L3 11l10-9V0z"/><path class="line" stroke="#007ABE" stroke-linecap="square" stroke-width="3" d="M3 11h26"/></g></svg>',

        'arrow-right' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 22"><g fill="none" fill-rule="evenodd"><path class="arrow" 
        fill="#007ABE" d="M18 22a1 1 0 0 0 2 0l11-10a1 1 0 0 0 0-2L20 0h-2v2l10 9-10 9v2z"/><path class="line" stroke="#007ABE" stroke-linecap="square" stroke-width="3" d="M28 11H2"/></g></svg>',
        
        'arrow-down' => '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 61 61">
  <defs>
    <circle id="b" cx="24.5" cy="24.5" r="24.5"/>
    <filter id="a" width="138.8%" height="138.8%" x="-17.3%" y="-17.3%">
      <feOffset dx="1" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"/>
      <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="3"/>
      <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0.592 0 0 0 0 0.592 0 0 0 0 0.592 0 0 0 1 0"/>
    </filter>
  </defs>
  <g fill="none" fill-rule="evenodd" transform="translate(5 5)">
    <use fill="#000" filter="url(#a)" xlink:href="#b"/>
    <use fill="#fff" xlink:href="#b"/>
    <path fill="#424242" d="M13.879 19.904a1.426 1.426 0 0 0 0 1.933L23.584 32.1c.248.263.574.401.914.401.34 0 .666-.138.915-.4l9.705-10.263c.51-.538.51-1.394 0-1.933a1.236 1.236 0 0 0-1.829 0L24.5 29.2l-8.792-9.295a1.259 1.259 0 0 0-1.828 0z"/>
  </g>
</svg>',
        
        'chevron' => '<svg width="22" height="13" xmlns="http://www.w3.org/2000/svg"><path d="M.379.404a1.426 1.426 0 0 0 0 1.933L10.084 12.6c.248.263.574.401.914.401.34 0 .666-.138.915-.4l9.705-10.263c.51-.538.51-1.394 0-1.933a1.236 1.236 0 0 0-1.829 0L11 9.7 2.206.404a1.259 1.259 0 0 0-1.828 0z" fill="#D7D5D5" fill-rule="evenodd"/></svg>',
        
        'chevron-pink' => '<svg width="37" height="37" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-90 18.5 18.5)" fill="none" fill-rule="evenodd"><circle stroke="#ED4399" stroke-width="3" fill="#FFF" cx="18.048" cy="18.048" r="16.548"/><path d="M10.224 14.662a1.05 1.05 0 0 0 0 1.425l7.149 7.559a.921.921 0 0 0 .674.295c.25 0 .49-.102.673-.295l7.15-7.56a1.041 1.041 0 0 0 0-1.424.91.91 0 0 0-1.348 0l-6.475 6.847-6.476-6.847a.927.927 0 0 0-1.347 0z" fill="#ED4399"/></g></svg>',
        
        
        'home-sections-line' => '<svg height="12" viewBox="0 0 551 12" width="551" xmlns="http://www.w3.org/2000/svg"><path d="m3 840h10.729518l12.217063-8 12.7257075 8h511.5230235" fill="none" stroke="#64a70b" stroke-linecap="square" stroke-width="3" transform="translate(-1 -830)"/></svg>',
   
        // social icons https://codepen.io/ruandre/pen/howFi
	
		'facebook' => '<svg aria-hidden="true" data-prefix="fab" data-icon="facebook-f" class="svg-inline--fa fa-facebook-f fa-w-9" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264 512"><path fill="currentColor" d="M76.7 512V283H0v-91h76.7v-71.7C76.7 42.4 124.3 0 193.8 0c33.3 0 61.9 2.5 70.2 3.6V85h-48.2c-37.8 0-45.1 18-45.1 44.3V192H256l-11.7 91h-73.6v229"></path></svg>',
		
		'linkedin' => '<svg aria-hidden="true" data-prefix="fab" data-icon="linkedin" class="svg-inline--fa fa-linkedin fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path></svg>',
		
		'twitter' => '<svg aria-hidden="true" data-prefix="fab" data-icon="twitter" class="svg-inline--fa fa-twitter fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg>',

		'instagram' => '<svg aria-hidden="true" data-prefix="fab" data-icon="instagram" class="svg-inline--fa fa-instagram fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path></svg>',
        
        'pinterest' => '<svg aria-hidden="true" data-prefix="fab" data-icon="pinterest-p" class="svg-inline--fa fa-pinterest-p fa-w-12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M204 6.5C101.4 6.5 0 74.9 0 185.6 0 256 39.6 296 63.6 296c9.9 0 15.6-27.6 15.6-35.4 0-9.3-23.7-29.1-23.7-67.8 0-80.4 61.2-137.4 140.4-137.4 68.1 0 118.5 38.7 118.5 109.8 0 53.1-21.3 152.7-90.3 152.7-24.9 0-46.2-18-46.2-43.8 0-37.8 26.4-74.4 26.4-113.4 0-66.2-93.9-54.2-93.9 25.8 0 16.8 2.1 35.4 9.6 50.7-13.8 59.4-42 147.9-42 209.1 0 18.9 2.7 37.5 4.5 56.4 3.4 3.8 1.7 3.4 6.9 1.5 50.4-69 48.6-82.5 71.4-172.8 12.3 23.4 44.1 36 69.3 36 106.2 0 153.9-103.5 153.9-196.8C384 71.3 298.2 6.5 204 6.5z"></path></svg>',
                		
		'vimeo' => '<svg aria-hidden="true" data-prefix="fab" data-icon="vimeo-v" class="svg-inline--fa fa-vimeo-v fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M447.8 153.6c-2 43.6-32.4 103.3-91.4 179.1-60.9 79.2-112.4 118.8-154.6 118.8-26.1 0-48.2-24.1-66.3-72.3C100.3 250 85.3 174.3 56.2 174.3c-3.4 0-15.1 7.1-35.2 21.1L0 168.2c51.6-45.3 100.9-95.7 131.8-98.5 34.9-3.4 56.3 20.5 64.4 71.5 28.7 181.5 41.4 208.9 93.6 126.7 18.7-29.6 28.8-52.1 30.2-67.6 4.8-45.9-35.8-42.8-63.3-31 22-72.1 64.1-107.1 126.2-105.1 45.8 1.2 67.5 31.1 64.9 89.4z"></path></svg>',
        
        'youtube' => '<svg aria-hidden="true" data-prefix="fab" data-icon="youtube" class="svg-inline--fa fa-youtube fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path></svg>',
	 
        'email' => '<svg aria-hidden="true" data-prefix="far" data-icon="envelope" class="svg-inline--fa fa-envelope fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.805c-22.422 18.259-58.168 46.651-134.587 106.49-16.841 13.247-50.201 45.072-73.413 44.701-23.208.375-56.579-31.459-73.413-44.701C106.18 199.465 70.425 171.067 48 152.805V112h416zM48 400V214.398c22.914 18.251 55.409 43.862 104.938 82.646 21.857 17.205 60.134 55.186 103.062 54.955 42.717.231 80.509-37.199 103.053-54.947 49.528-38.783 82.032-64.401 104.947-82.653V400H48z"></path></svg>',
                
	);
	
	if( isset( $svgs[$type] ) ) {
		return $svgs[$type];	
	}
	
}


function _s_get_svg( $type = '' ) {
    return get_svg( $type );
}