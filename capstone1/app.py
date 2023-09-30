from forms import LoginForm, SignupForm, AddPokemonForm, EditPokemonForm
from flask import Flask, redirect, render_template, request, flash, session, g
# from flask_debugtoolbar import DebugToolbarExtension
import requests
import helper

from models import User, UserMon, Pokemon, db, connect_db

app = Flask(__name__)
app.app_context().push()
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
app.config['SECRET_KEY'] = "supersecret"
# debug = DebugToolbarExtension(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///pokemon'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

connect_db(app)
db.create_all()

CURR_USER_KEY = "curr_user"
ADDED = True
URL = "https://pogoapi.net/api/v1/"
tag = "pokemon_names.json"

def add_user_to_g():
    """If we're logged in, add curr user to Flask global."""
    # print(g.user)
    # print(CURR_USER_KEY)
    # print(session[CURR_USER_KEY])
    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY]) 
    else:
        g.user = None

def do_login(user):
    """Log in user."""
    session[CURR_USER_KEY] = user.id


def do_logout():
    """Logout user."""
    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]

@app.before_request
def setup():
    add_user_to_g()
    if not ADDED:
        helper.populate_pokemon()

@app.route('/')
def landing_page():
    """redirect to user page, or login page"""
    return redirect("/login")

@app.route('/login', methods=["GET", "POST"])
def login():
    """Display login page if no user is logged in"""
    # TODO Fix this - using curr_user
    if CURR_USER_KEY in session:
        return redirect('/user/pokemon')
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        user = User.authenticate(username, password)
        if user:
            do_login(user)
            return redirect('/user/pokemon')
        else:
            form.username.errors = ['Invalid username or password']
            return render_template('login.html', form=form)
    else:
        return render_template("login.html", form=form)

@app.route('/signup', methods=["GET", "POST"])
def signup():
    """Display signup page"""
    if CURR_USER_KEY in session:
        return redirect('/user/pokemon')
    form = SignupForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        user_exists = User.user_exists(username)
        if user_exists:
            form.username.errors = ['Username taken']
            return render_template('signup.html', form=form)
        else:
            user = User.register(username, password)
            db.session.add(user)
            db.session.commit()
            do_login(user)
            # Better to initialize account with adding pokemon
            return redirect('/user/pokemon')
    else:
        return render_template("signup.html", form=form)
    

@app.route('/user/pokemon', methods=["GET"])
def display_user():
    """Dispay all pokemon for logged in user"""
    user = g.user
    pokemon = UserMon.query.filter_by(user_id=user.id).all()
    return render_template("user.html", pokemon=pokemon, user=user)

@app.route('/user/pokemon/<id>/details', methods=["GET"])
def display_details(id):
    """display details for specified pokemon"""
    mon = UserMon.query.filter_by(owns_id=id).first()
    return render_template("details.html", mon=mon)

@app.route('/user/pokemon/<id>/edit', methods=["GET", "POST"])
def edit_pokemon(id):
    """Edit details for a user's pokemon"""
    
    mon = UserMon.query.filter_by(owns_id = id).first()
    form = EditPokemonForm(obj=mon)
    if form.validate_on_submit():
        mon.cp = form.cp.data
        mon.atk = form.atk.data
        mon.dfn = form.dfn.data
        mon.hp = form.hp.data
        db.session.add(mon)
        db.session.commit()
        return redirect("/pokemon")
    return render_template('edit.html', mon=mon, form=form)

@app.route('/pokemon', methods=["GET"])
def display_all():
    """Display all pokemon"""
    list = Pokemon.query.all()
    return render_template("pokemon.html", list=list)

@app.route('/user/pokemon/add', methods=["GET", "POST"])
def add_pokemon():
    """display form for adding pokemon to user's inventory"""
    # TODO - cast to lower case
    # Dropdown/autofill ala fruit search
    form = AddPokemonForm()
    user = g.user
    if form.validate_on_submit():
        name = form.name.data
        mon = Pokemon.query.filter_by(name=name).first()
        id = mon.id
        cp = form.cp.data
        atk = form.atk.data
        dfn = form.dfn.data
        hp = form.hp.data
        mon = UserMon(pokemon_id = id, cp = cp, user_id = user.id, atk = atk , dfn = dfn , hp = hp)
        db.session.add(mon)
        db.session.commit()
        return redirect("/pokemon")
    return render_template("add.html", form=form)

@app.route('/logout')
def logout():
    """Handle logout of user."""
    do_logout()
    flash("Successfully Logged Out")
    return redirect("/login")



"""
TODO
- set up basic views
- set up login
- set up templates
- search functionality - mirror fruit search


-------
Stretch
-- Add types
-- Add moves
-- sort by id/name/type (if implemented)
"""