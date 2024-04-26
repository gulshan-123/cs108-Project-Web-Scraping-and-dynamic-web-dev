# Movie-Mania

## Description
Problem Statement: https://docs.google.com/document/d/1EKm1F_SBxaBs4hLl5LWFjiimTbtBdOCRdUVhMCLRZ4M/

This project is a part of CS108-Software and System Lab Endsem at IIT Bombay. I have done this under the guidance of Sabyasachi Samantaray, our TA and Prof. Kameswari Chebrolu.

Movie Mania is a web application designed to serve as a comprehensive movie repository, offering users access to information about a vast collection of movies and providing personalized movie recommendations.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)


## Installation

Make sure you have nodejs and npm installed on your computer.
cd into the project directory. Then write ``` npm i ``` on command-line. It will install all the necessary dependencies required to run this project.

Now write ```node 1.js``` on command line. It will start the server.
Head into your browser and type: ```localhost:3000``` to see the homepage. Navigate freely and enjoy the site!

## Usage

On the homepage, there will be several movies list sorted on the basis of IMDB ratings. I have included top 250 movies. You can see the Title, Directors, Casts, Year of Release, Genre , Duration and its imdb ratings on each movie-card.

On clicking on the movie cards, you can also see a short plot, its Youtube Trailer embedded on the page, User Reviews from metacritic (both the positive and negative reviews are included) and some famous critics reviews.

You can also search for the movies in the search bar. It will return the best possible match considering the Movie Title and your query, i.e., it can autocorrect your query.

The above features are available to all the users, either logged in or not. 

For seeing the recommendations, rating movies, you need to log in to the site. If you are new, consider first signing up. Then you can rate some of the movies and get the recommended movies in the recommendation tab.

