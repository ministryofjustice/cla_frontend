$(function(){
  $('.UserMenu-toggle').click(function(e){
    e.preventDefault();

    if ($('.UserMenu').hasClass('is-visible')) {
      toggleMenu(false);
    } else {
      toggleMenu(true);
    }
  });
});

function toggleMenu (toggle) {
  // bind/unbind click listener to show/hide results
  if (toggle) {
    $('body').on('click.UserMenuDelegate', function (e) {
      if ($(e.target).parents('.UserMenu').length < 1) {
        toggleMenu(false);
      }
    });
  } else {
    $('body').off('click.UserMenuDelegate');
  }

  $('.UserMenu').toggleClass('is-visible');
}