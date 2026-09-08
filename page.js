(function(){'use strict';
if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;
e.target.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],
{duration:520,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});io.unobserve(e.target);});},{threshold:.15});
document.querySelectorAll('.tool,.syl__item,.facts div,.next a,.pull,.aud .note,.tbl-scroll').forEach(function(el){io.observe(el);});})();