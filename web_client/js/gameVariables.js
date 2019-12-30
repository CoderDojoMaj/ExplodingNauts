var scrollRect = document.querySelector('.scrollRect#hand_scroll')

var ek_position_defused = document.getElementById('ek_position_defused');
var ek_index = 0;

var stackHandSnapCard = document.getElementById('stackHandSnap')
var stackSnapCard = document.getElementById('stackSnap')
var snapElements = [stackHandSnapCard, stackSnapCard];

var cardsInStack = [];
var cardsInStackHand = [];
var cardZIndex = 3;
var localDeck = [];
var localDiscardPile = [];

var handScrollPos = 0, maxHandScrollPos = 0, handWidth = 0;

var hand = [];
var cardTypes = ["ExplodingKitten", "Attack", "Defuse", "Nope", "SeeTheFuture", "Skip", "Favor", "Shuffle", "RainbowCat", "HairyPotatoCat", "TacoCat", "BeardCat", "Cattermelon", "TargetedAttack"];
var cardNames = ["Exploding Kitten", "Attack", "Defuse", "Nope", "See The Future (x3)", "Skip", "Favor", "Shuffle", "Rainbow Cat", "Hairy Potato Cat", "Tacocat", "Beard Cat", "Cattermelon", "Targeted Attack"];
var playableCards = ["Attack", "Defuse", "Nope", "SeeTheFuture", "Skip", "Favor", "Shuffle", "RainbowCat", "HairyPotatoCat", "TacoCat", "BeardCat", "Cattermelon", "TargetedAttack"]

var playerList = [];
var spectatorList = [];

var peopleModalReason = "";

var selectedPlayer = "";