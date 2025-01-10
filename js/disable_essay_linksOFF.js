(function () {
    function disableLinksInEssayAnswers( doc ) {
        var links = doc.getElementsByTagName('a');
        for ( var i = 0; i < links.length; i++ ) {
            if ( links[i].hasAttribute( 'data-mce-selected' )
              || links[i].hasAttribute( 'data-mce-href' )
              ) {
                links[i].removeAttribute( 'href' );
            }
        }
    }
    function getFrames( frame, frameArray ) {
        frameArray.push( frame.frames );
        for ( var i = 0; i < frame.frames.length; i++ ) {
            getFrames( frame.frames[i], frameArray );
        }
        return frameArray;
    }
    window.setInterval( function() {
        var allFrames = getFrames( window, new Array() );
        for ( var i = 0; i < allFrames.length; i++ ) {
            disableLinksInEssayAnswers( allFrames[i].document );
        }
    }, 500 );
})();