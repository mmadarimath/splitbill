import { useState } from "react";

/* =========================
   UI BUTTON
========================= */

function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button className={`button ${className}`} type={type} onClick={onClick}>
      {children}
    </button>
  );
}

/* =========================
   APP
========================= */

export default function App() {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  /* ---------- UI actions ---------- */

  function handleShowAdd() {
    setShowAdd((s) => !s);
    setSelectedFriend(null);
    setIsEditing(false);
  }

  function handleSelectFriend(friend) {
    setSelectedFriend((cur) => (cur?.id === friend.id ? null : friend));
    setShowAdd(false);
    setIsEditing(false);
  }

  /* ---------- CRUD ---------- */

  function handleAddFriend(friend) {
    setFriends((f) => [...f, friend]);
    setShowAdd(false);
  }

  function handleDeleteFriend(friend) {
    setFriends((friends) =>
      friends.filter((f) => f.id !== friend.id)
    );

    if (selectedFriend?.id === friend.id) {
      setSelectedFriend(null);
      setIsEditing(false);
    }
  }

  /* ---------- SPLIT LOGIC ---------- */

  function handleSplitBill(value) {
    setFriends((friends) =>
      friends.map((friend) =>
        friend.id === selectedFriend.id
          ? {
              ...friend,
              balance: friend.balance + value,
              lastSplit: value,
            }
          : friend
      )
    );

    setSelectedFriend(null);
  }

  function handleEditSplit(newValue) {
    setFriends((friends) =>
      friends.map((friend) =>
        friend.id === selectedFriend.id
          ? {
              ...friend,
              balance: friend.balance - friend.lastSplit + newValue,
              lastSplit: newValue,
            }
          : friend
      )
    );

    setSelectedFriend(null);
    setIsEditing(false);
  }

  return (
    <main className="page">
      <h1 className="page-title">Split the Bill</h1>

      <div className="app">
        <aside className="sidebar">
          <FriendList
            friends={friends}
            selectedFriend={selectedFriend}
            onSelect={handleSelectFriend}
            onDelete={handleDeleteFriend}
            onEdit={(friend) => {
              setSelectedFriend(friend);
              setIsEditing(true);
            }}
          />

          {showAdd && <FormAddFriend onAddFriend={handleAddFriend} />}

          <Button onClick={handleShowAdd}>
            {showAdd ? "Close" : "Add New"}
          </Button>
        </aside>

        {selectedFriend && (
          <FormSplitBill
            friend={selectedFriend}
            isEditing={isEditing}
            onSplitBill={handleSplitBill}
            onEditSplit={handleEditSplit}
          />
        )}
      </div>
    </main>
  );
}

/* =========================
   FRIEND LIST
========================= */

function FriendList({ friends, selectedFriend, onSelect, onDelete, onEdit }) {
  if (friends.length === 0) {
    return (
      <div className="friendlist-empty">
        <p>No friends yet</p>
        <span>Add a friend to start splitting bills</span>
      </div>
    );
  }

  return (
    <ul className="friendlist">
      {friends.map((friend) => (
        <Friend
          key={friend.id}
          friend={friend}
          selectedFriend={selectedFriend}
          onSelect={onSelect}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}

function Friend({ friend, selectedFriend, onSelect, onDelete, onEdit }) {
  const isSelected = selectedFriend?.id === friend.id;

  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt={friend.name} />

      <div className="friend-info">
        <h3>{friend.name}</h3>

        {friend.balance < 0 && (
          <p className="red">
            You owe ₹{Math.abs(friend.balance)}
          </p>
        )}

        {friend.balance > 0 && (
          <p className="green">
            Owes you ₹{friend.balance}
          </p>
        )}

        {friend.balance === 0 && <p>Owes & Owed ₹0</p>}
      </div>

      <div className="friend-actions">
        <Button onClick={() => onSelect(friend)}>
          {isSelected ? "Close" : "Select"}
        </Button>

        {friend.lastSplit !== undefined && (
          <Button onClick={() => onEdit(friend)}>Edit</Button>
        )}

        <Button className="danger" onClick={() => onDelete(friend)}>
          Delete
        </Button>
      </div>
    </li>
  );
}

/* =========================
   ADD FRIEND FORM
========================= */

function FormAddFriend({ onAddFriend }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("https://i.pravatar.cc/48");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const id = crypto.randomUUID();

    onAddFriend({
      id,
      name,
      image: `${image}?u=${id}`,
      balance: 0,
    });

    setName("");
    setImage("https://i.pravatar.cc/48");
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />

      <label>Image URL</label>
      <input value={image} onChange={(e) => setImage(e.target.value)} />

      <Button type="submit">Add</Button>
    </form>
  );
}

/* =========================
   SPLIT / EDIT BILL FORM
========================= */

function FormSplitBill({
  friend,
  onSplitBill,
  onEditSplit,
  isEditing,
}) {
  const [bill, setBill] = useState("");
  const [paidByUser, setPaidByUser] = useState("");
  const [payer, setPayer] = useState("user");

  const billValue = bill === "" ? 0 : Number(bill);
  const userExpense = paidByUser === "" ? 0 : Number(paidByUser);
  const friendExpense = bill === "" ? "" : billValue - userExpense;

  function handleSubmit(e) {
    e.preventDefault();
    if (bill === "" || paidByUser === "") return;

    const value = payer === "user" ? friendExpense : -userExpense;

    isEditing ? onEditSplit(value) : onSplitBill(value);
  }

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>
        {isEditing ? "Edit split with" : "Split bill with"} {friend.name}
      </h2>

      <label>Bill value</label>
      <input value={bill} onChange={(e) => setBill(e.target.value)} />

      <label>Your expense</label>
      <input
        value={paidByUser}
        onChange={(e) => {
          if (Number(e.target.value) > billValue) return;
          setPaidByUser(e.target.value);
        }}
      />

      <label>{friend.name}'s expense</label>
      <input disabled value={friendExpense} />

      <label>Who is paying?</label>
      <select value={payer} onChange={(e) => setPayer(e.target.value)}>
        <option value="user">You</option>
        <option value="friend">{friend.name}</option>
      </select>

      <Button type="submit">
        {isEditing ? "Update Split" : "Split Bill"}
      </Button>
    </form>
  );
}



// Single split bill
// Multi split bill