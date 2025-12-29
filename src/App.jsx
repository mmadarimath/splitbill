import { useState } from "react";

/* -------------------- DATA -------------------- */

const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118842",
    balance: -750,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 920,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

/* -------------------- UI -------------------- */

function Button({ children, onClick, type = "button" }) {
  return (
    <button className="button" type={type} onClick={onClick}>
      {children}
    </button>
  );
}

/* -------------------- APP -------------------- */

export default function App() {
  const [friends, setFriends] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  function handleShowAdd() {
    setShowAdd((s) => !s);
    setSelectedFriend(null); // close split bill
  }

  function handleAddFriend(friend) {
    setFriends((f) => [...f, friend]);
    setShowAdd(false);
  }

  function handleSelectFriend(friend) {
    setSelectedFriend((cur) =>
      cur?.id === friend.id ? null : friend
    );
    setShowAdd(false); // close add form
  }

  function handleSplitBill(value) {
    setFriends((friends) =>
      friends.map((friend) =>
        friend.id === selectedFriend.id
          ? { ...friend, balance: friend.balance + value }
          : friend
      )
    );
    setSelectedFriend(null);
  }

  return (
    
    // <div className="app">
    //   <h1 style={{display: "block"}}>Split the Bill</h1>
        
    //   <aside className="sidebar">
    //     <FriendList
    //       friends={friends}
    //       selectedFriend={selectedFriend}
    //       onSelect={handleSelectFriend}
    //     />

    //     {showAdd && <FormAddFriend onAddFriend={handleAddFriend} />}

    //     <Button onClick={handleShowAdd}>
    //       {showAdd ? "Close" : "Add New"}
    //     </Button>
    //   </aside>

    //   {selectedFriend && (
    //     <FormSplitBill
    //       friend={selectedFriend}
    //       onSplitBill={handleSplitBill}
    //     />
    //   )}
    // </div>

     <main className="page">
    <h1 className="page-title">Split the Bill</h1>

    <div className="app">
      <aside className="sidebar">
        <FriendList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelect={handleSelectFriend}
        />

        {showAdd && <FormAddFriend onAddFriend={handleAddFriend} />}

        <Button onClick={handleShowAdd}>
          {showAdd ? "Close" : "Add New"}
        </Button>
      </aside>

      {selectedFriend && (
        <FormSplitBill
          friend={selectedFriend}
          onSplitBill={handleSplitBill}
        />
      )}
    </div>
  </main>
  );
}

/* -------------------- FRIEND LIST -------------------- */

function FriendList({ friends, selectedFriend, onSelect }) {
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
        />
      ))}
    </ul>
  );
}

function Friend({ friend, selectedFriend, onSelect }) {
  const isSelected = selectedFriend?.id === friend.id;

  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt={friend.name} />
      <h3>{friend.name}</h3>

      {friend.balance < 0 && (
        <p className="red">
          You owe {friend.name} ₹{Math.abs(friend.balance)}
        </p>
      )}

      {friend.balance > 0 && (
        <p className="green">
          {friend.name} owes you ₹{friend.balance}
        </p>
      )}

      {friend.balance === 0 && <p>Owes & Owed ₹0</p>}

      <Button onClick={() => onSelect(friend)}>
        {isSelected ? "Close" : "Select"}
      </Button>
    </li>
  );
}

/* -------------------- ADD FRIEND -------------------- */

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
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>Image URL</label>
      <input
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />

      <Button type="submit">Add</Button>
    </form>
  );
}

/* -------------------- SPLIT BILL -------------------- */

function FormSplitBill({ friend, onSplitBill }) {
  const [bill, setBill] = useState("");
  const [paidByUser, setPaidByUser] = useState("");
  const [payer, setPayer] = useState("user");

  // Convert ONLY when needed
  const billValue = bill === "" ? 0 : Number(bill);
  const userExpense = paidByUser === "" ? 0 : Number(paidByUser);
  const friendExpense =
    bill === "" ? "" : billValue - userExpense;

  function handleSubmit(e) {
    e.preventDefault();

    if (bill === "" || paidByUser === "") return;

    const value =
      payer === "user"
        ? friendExpense
        : -userExpense;

    onSplitBill(value);
  }

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>Split bill with {friend.name}</h2>

      <label>Bill value</label>
      <input
        type="text"
        value={bill}
        onChange={(e) => setBill(e.target.value)}
        inputMode="numeric"
        placeholder="Enter total bill"
      />

      <label>Your expense</label>
      <input
        type="text"
        value={paidByUser}
        onChange={(e) => {
          if (Number(e.target.value) > billValue) return;
          setPaidByUser(e.target.value);
        }}
        inputMode="numeric"
        placeholder="Your share"
      />

      <label>{friend.name}'s expense</label>
      <input
        type="text"
        disabled
        value={friendExpense}
      />

      <label>Who is paying?</label>
      <select
        value={payer}
        onChange={(e) => setPayer(e.target.value)}
      >
        <option value="user">You</option>
        <option value="friend">{friend.name}</option>
      </select>

      <Button type="submit">Split bill</Button>
    </form>
  );
}
