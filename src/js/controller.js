import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

///////////////////////////////////////
//if (module.hot) {
// module.hot.accept();
//}
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    //render spinner
    recipeView.renderSpinner();

    //0-update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    // 1-updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
    //2-Loading recipe
    await model.loaadRecipe(id);

    //3- Rendering recipe

    //send data to a object of class in view
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError(`${err} !!!!!!!!!!^_ ^`);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1-Get search query
    const query = searchView.getQuery();
    if (!query) return;
    //2- Load search results
    await model.loadSearchResult(query);

    //3-Render results
    //resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //4- Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
    recipeView.renderError(`${err} !!!!!!!!!!^_ ^`);
  }
};

const controlPagination = function (gotToPage) {
  //1- Render new results
  resultsView.render(model.getSearchResultsPage(gotToPage));
  //2-render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings (in state)
  model.updateServings(newServings);

  //update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddbookmark = function () {
  //1- Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2-update recipe view
  recipeView.update(model.state.recipe);

  //3-render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loadinbg spinner
    addRecipeView.renderSpinner();

    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMes();

    //render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change ID in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form window after 2.5 sec
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('!!!!!', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addhandlerBookmark(controlAddbookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
