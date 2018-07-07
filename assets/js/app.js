$(document).ready(function () {

  var storeResponse;
  var storeDrinks = []
  var counter = 0;
  var indNuber = 0;
  var countStart = 0;
  var countEnd = 3;
  var type = "";


  $('#main-container').hide();
  $("#card1").hide();
  $("#card2").hide();
  $("#card3").hide();
  $('#lessButton').hide();
  $('#moreButton').hide();
  $('.parallax').parallax();

  var general = {
    mlButton: function () {
      if (countStart === 0) {
        $('#lessButton').hide();
        $('#moreButton').hide();
      } else if (countStart === 3) {
        $('#lessButton').hide();
        $('#moreButton').show();
      } else if (countStart >= 3 && countEnd < 27) {
        $('#lessButton').show();
        $('#moreButton').show();
      } else if (countEnd > 27) {
        $('#lessButton').show();
        $('#moreButton').hide();
      }
    },
    more: function () { //Shows 3 more recipies.
      countEnd += 3;
      if (type === "food") {
        food.print();
      } else {
        storeDrinks = [];
        drinks.pullRecipes();
      }
    },

    less: function () {
      countStart -= 6;
      countEnd -= 3;
      if (type === "food") {
        food.print()();
      } else {
        storeDrinks = [];
        drinks.pullRecipes();
      }
    }
  }

  //Saved to firebase
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyA4z9UNz-9YYl6NIOOX9r7e78bXl8n0kFs",
    authDomain: "flayvor-700bf.firebaseapp.com",
    databaseURL: "https://flayvor-700bf.firebaseio.com",
    projectId: "flayvor-700bf",
    storageBucket: "flayvor-700bf.appspot.com",
    messagingSenderId: "16945531953"
  };
  firebase.initializeApp(config);
  var database = firebase.database();


  function googleLogin() {
    // Start a sign in process for an unauthenticated user.
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    // ---------------POPUP-------------------------
    firebase.auth().signInWithPopup(provider).then(function (result) {
      var user = result.user;
      var token = result.credential.accessToken;
      console.log(user)
      console.log(token)
    });
  }

  var user = firebase.auth().currentUser;

if (user != null) {
  user.providerData.forEach(function (profile) {
    console.log("  Name: " + profile.displayName);
    console.log("  Email: " + profile.email);
    $("#userName").append("Welcome " + profile.displayName);
  });
}

  var historySearch = {

    read: function () {

      database.ref().limitToLast(5).on('child_added', function (snapshot) {

        var ingredient1 = snapshot.val().ingredient;

        $("#userEmail").append("<p>" + ingredient1 + "</p>");

      });

    },

    write: function () {

      var ingredientFb = $("#ingredients").val().trim();
      console.log(ingredientFb);

      var savedSearch = {
        ingredient: ingredientFb
      }
      database.ref().push(savedSearch);
    }

  }

  var topRecipes = {

    write: function () {

      function snapshotToArray(snapshot) {

        var returnArr = [];

        snapshot.forEach(function (childSnapshot) {
          var item = childSnapshot.val().ingredient;
          returnArr.push(item);
        });
        return returnArr;
      };

      firebase.database().ref().on("value", function (snapshot) {
        var topTrend = snapshotToArray(snapshot);
        console.log(topTrend);

        for (var i = 0; i < topTrend.length; i++) {
          if (topTrend[i + 3] == topTrend[i]) {
            $("#topIn").append("<p>" + topTrend[i] + "</p>");
          }
        }
      })

    }
  }

  topRecipes.write();
  historySearch.read();



  var food = {
    pull: function () {
      countStart = 0;
      countEnd = 3; //Returns countStart to 0
      var ingredients = $("#ingredients").val(); //Assign text typed by user to variable ingridients.
      var Uri = " https://api.edamam.com/search?q=" //Default start of API Url
      var Api = "&app_id=951c44a9&app_key=10fce9b48db6f70dd8fec5472069d5f7&from=0&to=30" //Default end of the API Url.
      var queryUrl = Uri + ingredients + Api; //Merge the start + the ingridients typed by user + the end of the API Url.
      console.log(queryUrl);
      $.ajax({ //Using ajax to get the json that contains the recipies.
        url: queryUrl,
        method: "GET"
      }).then(function (response) { //Stores the JSON obtained in the temp variable "response"
        storeResponse = response; //Saves JSON response to local variable in case we need to use response in the future.
        console.log(storeResponse);
        food.print(); //Calls the "printer"
      })
    },
    print: function () {
      $("#top-recipes").empty(); //Cleans DIV where car's are gonna be generated

      for (countStart; countStart < countEnd; countStart++) { //Runs a defined amount of times to create Cards.
        var col = $("<div>");
        var card = $("<div>");
        var cardImg = $("<div>");
        var cardImgSrc = $("<img>");
        var cardCont = $("<div>");
        var cardContSp = $("<span>");
        var cardContUrl = $("<p>");
        var cardRev = $("<div>");
        var cardRevSp = $("<span>");
        var cardRevP = $("<p>");
        var cardRevUl = $("<ul>");

        col.attr('class', "col s12 m4 l4");
        card.attr('class', "card");
        cardImg.attr('class', "card-image waves-effect waves-block waves-light");
        cardImgSrc.attr('class', 'activator');
        cardImgSrc.attr('src', storeResponse.hits[countStart].recipe.image);
        cardImg.append(cardImgSrc);
        cardCont.attr('class', 'card-content');
        cardContSp.attr('class', 'card-title activator grey-text text-darken-4');
        cardContSp.append(storeResponse.hits[countStart].recipe.label + '<i class="material-icons right">more_vert</i>');
        cardContUrl.append('<a href="#">Full Recipe & Instructions.</a>');
        cardCont.append(cardContSp);
        cardCont.append(cardContUrl);
        cardRev.attr('class', 'card-reveal');
        cardRevSp.attr('class', 'card-title grey-text text-darken-4');
        cardRevSp.append('Ingredients<i class="material-icons right">close</i>');
        var ingCount = storeResponse.hits[countStart].recipe.ingredientLines.length; //Counts the ingridients included in the recipie.
        for (var m = 0; m < ingCount; m++) { //This for loop is in charge of adding the lines of ingridients to the Card Reveal.
          cardRevUl.append("<li>" + storeResponse.hits[countStart].recipe.ingredientLines[m] + "</li>");
        };
        cardRevP.append(cardRevUl);
        cardRev.append(cardRevSp);
        cardRev.append(cardRevP);

        card.append(cardImg);
        card.append(cardCont);
        card.append(cardRev);

        col.append(card);

        $("#top-recipes").append(col);
      }
      general.mlButton();
    },
  };

  var drinks = {
    pull: function () {
      countStart = 0; //Reset Start Count to 0.
      countEnd = 3;
      var ingredients = $("#ingredients").val().trim(); //Get the ingridients typed by user.
      var uri = "https://thecocktaildb.com/api/json/v1/1/filter.php?i="; //Base QueryURL.
      var queryUrl = uri + ingredients; //Merge variables to create Query URL.
      console.log(queryUrl); //Console the QueryURL.
      $.ajax({ //Using ajax to get the json that contains the recipies.
        url: queryUrl,
        method: "GET"
      }).then(function (response) { //Stores the JSON obtained in the temp variable "response"
        storeResponse = response; //Saves JSON response to local variable in case we need to use response in the future.
        console.log(storeResponse); //Console log the JSON.
        drinks.pullRecipes(); //Calls the "printer"
      });
    },

    pullRecipes: function () {
      var counta = countStart
      var countb = countEnd;
      console.log(counta, countb);
      for (counta; counta < countb; counta++) { //Runs a defined amount of times to create Cards.

        var queryDrink = "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=" + storeResponse.drinks[counta].idDrink;
        console.log(queryDrink);
        $.ajax({
          url: queryDrink,
          method: "GET"
        }).then(function (drinkResponse) {
          storeDrinks.push(drinkResponse);
          console.log(storeDrinks);
        });
      }
      //Cleans DIV where car's are gonna be generated
      drinks.print();
    },

    print: function () {
      $("#top-recipes").empty();
      for (countStart; countStart < countEnd; countStart++) {
        var col = $("<div>");
        var card = $("<div>");
        var cardImg = $("<div>");
        var cardImgSrc = $("<img>");
        var cardCont = $("<div>");
        var cardContSp = $("<span>");
        var cardContUrl = $("<p>");
        var cardRev = $("<div>");
        var cardRevSp = $("<span>");
        var cardRevP = $("<p>");
        var cardRevUl = $("<ul>");
        col.attr('class', "col s12 m4 l4");
        card.attr('class', "card");
        cardImg.attr('class', "card-image waves-effect waves-block waves-light");
        cardImgSrc.attr('class', 'activator');
        cardImgSrc.attr('src', storeResponse.drinks[countStart].strDrinkThumb);
        cardImg.append(cardImgSrc);
        cardCont.attr('class', 'card-content');
        cardContSp.attr('class', 'card-title activator grey-text text-darken-4');
        cardContSp.attr('id', 'drinkName-' + countStart);
        cardContSp.attr('drinkn', storeResponse.drinks[countStart].strDrink);
        cardContSp.append(storeResponse.drinks[countStart].strDrink + '<i class="material-icons right">more_vert</i>');
        cardCont.append(cardContSp);
        cardRev.attr('class', 'card-reveal');
        cardRevSp.attr('class', 'card-title grey-text text-darken-4');
        cardRevSp.append('Ingredients<i class="material-icons right">close</i>');
        cardRevUl.attr('id', 'list-' + [counter]);
        cardRevP.append(cardRevUl);
        cardRev.append(cardRevSp);
        cardRev.append(cardRevP);
        card.append(cardImg);
        card.append(cardCont);
        card.append(cardRev);
        col.append(card);
        $("#top-recipes").append(col);
        counter++;
      }
      countStart -= 3;
      drinks.list();
    },

    list: function () {
      setTimeout(function () {
        for (countStart; countStart < countEnd; countStart++) {
          var g = 0;
          var h = 3;
          for (g; g < h; g++) {
            var dName = $("#drinkName-" + countStart).attr("drinkn");
            var evaluator = storeDrinks[g].drinks[0].strDrink;
            if (dName === evaluator) {
              indNuber = g;
            }
          }
          var ingr0 = storeDrinks[indNuber].drinks[0].strIngredient1;
          var ingr1 = storeDrinks[indNuber].drinks[0].strIngredient2;
          var ingr2 = storeDrinks[indNuber].drinks[0].strIngredient3;
          var ingr3 = storeDrinks[indNuber].drinks[0].strIngredient4;
          var ingr4 = storeDrinks[indNuber].drinks[0].strIngredient5;
          var ingr5 = storeDrinks[indNuber].drinks[0].strIngredient6;
          var ingr6 = storeDrinks[indNuber].drinks[0].strIngredient7;
          var ingr7 = storeDrinks[indNuber].drinks[0].strIngredient8;
          var ingr8 = storeDrinks[indNuber].drinks[0].strIngredient9;
          var ingr9 = storeDrinks[indNuber].drinks[0].strIngredient10;
          var meas0 = storeDrinks[indNuber].drinks[0].strMeasure1;
          var meas1 = storeDrinks[indNuber].drinks[0].strMeasure2;
          var meas2 = storeDrinks[indNuber].drinks[0].strMeasure3;
          var meas3 = storeDrinks[indNuber].drinks[0].strMeasure4;
          var meas4 = storeDrinks[indNuber].drinks[0].strMeasure5;
          var meas5 = storeDrinks[indNuber].drinks[0].strMeasure6;
          var meas6 = storeDrinks[indNuber].drinks[0].strMeasure7;
          var meas7 = storeDrinks[indNuber].drinks[0].strMeasure8;
          var meas8 = storeDrinks[indNuber].drinks[0].strMeasure9;
          var meas9 = storeDrinks[indNuber].drinks[0].strMeasure10;
          var Ingr = [ingr0, ingr1, ingr2, ingr3, ingr4, ingr5, ingr6, ingr7, ingr8, ingr9];
          var Meas = [meas0, meas1, meas2, meas3, meas4, meas5, meas6, meas7, meas8, meas9]
          for (y = 0; y < 10; y++) {
            $("#list-" + countStart).append("<li>" + Meas[y] + " " + Ingr[y] + "</li>");
          }
        }
        general.mlButton();
      }, 1000)
    },
  };

  $('#food-button').click(function () {
    type = "food";
    $("#top-recipes").empty();
    console.log(type);
    $("#main-container").show();
  });

  $('#drink-button').click(function () {
    type = "drinks";
    $("#top-recipes").empty();
    console.log(type);
    $("#main-container").show();
  });

  $('#flavorize-button').click(function () {
    if (type === "food") {
      food.pull();
    } else {
      counter = 0;
      drinks.pull();
    }
    $("#userName").append("Welcome " + profile.displayName);

    historySearch.write();

    $("#ingredients").val("");
  });

  $("#moreButton").on("click", function () {
    general.more();
  });

  $("#lessButton").on("click", function () {
    general.less();
  });

  // ref google login button.
  $("#googleLogin").on("click", function () {
    googleLogin();
    $("#userName").append("Welcome " + profile.displayName);

  });

  // });

  $('.sidenav').sidenav({
    menuWidth: 300,
    edge: 'right',
    closeOnClick: true,
    draggable: true,
    // onOpen: function(el)
    // onClose: function(el)
  });
  // // Show sideNav
  // $('.sidenav').sidenav('show');
  // // Hide sideNav
  // $('.sidenav').sidenav('hide');
  // // Destroy sideNav
  // $('.sidenav').sidenav('destroy');

  $('.chips').chips();
  $('.chips-placeholder').chips({
    placeholder: 'Add ingredient...',
    secondaryPlaceholder: 'add more...',

  });

});



// $('.sidenav-trigger').Sidenav({
//   menuWidth: 300, // Default is 240
//   closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
//   edge: 'right',
// }
// );
// $("[data-target=slide-out-r]").Sidenav({
//   edge: 'right'
// });
// $(".sidenav-trigger").Sidenav({
//   menuWidth: 300,
//   edge: 'right',
//   closeOnClick: true
// });
