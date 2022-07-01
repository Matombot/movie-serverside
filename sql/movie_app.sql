create table users (
    id serial not null  primary key,
    username text not null,
    password text not null,
    firstname text not null,
    lastname text not null
);

create table user_playlist(
  id serial not null primary key,
  users_id int,
  movie_list text not null,
 foreign key (users_id) references user_playlist(id)
);