import React, { ChangeEvent, FormEvent } from "react";

interface Item {
  id: string | undefined
  title: string
  done: boolean
}

interface ItemResponse {
  message: string
  items: Item[]
}

const listItems = async (): Promise<ItemResponse> => {
  const response = await fetch("/api/todos");
  return await response.json() as ItemResponse;
}

const createItem = async (item: Item) => {
  await fetch("/api/todos", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
}

const updateItem = async (item: Item) => {
  await fetch(`/api/todos/${item.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
}

const deleteItem = async (item: Item) => {
  await fetch(`/api/todos/${item.id}`, {
    method: 'DELETE',
  });
}

const evaluateItem = async (item: Item): Promise<Response> => {
  return await fetch(`/api/todos/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
}

export default function Todo() {
  const [reloadCount, setReloadCount] = React.useState(0);
  const [response, setResponse] = React.useState<ItemResponse | null>(null)

  const [title, setTitle] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    const worker = async () => {
      const response = await listItems();
      if (mounted) {
        setResponse(response);
      }
    };
    worker();
    return () => {
      mounted = false;
    }
  }, [reloadCount])

  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const item = { title: title, done: false, id: undefined }
    setTitle("");
    createItem(item).then(() => {
      setReloadCount(reloadCount + 1);
    });
  }

  const handleDelete = (item: Item) => {
    deleteItem(item).then(() => setReloadCount(reloadCount + 1));
  }

  const handleComplete = (item: Item) => {
    item.done = true
    updateItem(item).then(() => setReloadCount(reloadCount + 1));
  }

  const handleEvaluate = (e: FormEvent) => {
    e.preventDefault();
    const item = { title: title, done: false, id: undefined }
    evaluateItem(item).then(response => response.json()).then(data => { setFeedback(data.message) });
  }

  return <>
    <div className="row">
      <div className="col-8 p-4">
        <div className="container">
          <h3>Todo list</h3>
          {response?.message !== "" && <h6 className="text-secondary">{response?.message}</h6>}
          {response?.items && response.items.length > 0 ?
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {response.items.map(item => {
                  return <>
                    <tr>
                      <td>{item.title}</td>
                      <td>
                        <span className="material-icons">{item.done ? "done" : "lightbulb"}</span>
                      </td>
                      <td>
                        <button className="btn btn-small btn-outline-success mx-1" onClick={e => handleComplete(item)}>
                          Complete <i className="material-icons ms-4 align-top">done</i>
                        </button>
                        <button className="btn btn-small btn-outline-danger mx-1" onClick={e => handleDelete(item)}>
                          Delete <i className="material-icons ms-4 align-top">delete</i>
                        </button>
                      </td>
                    </tr>
                  </>;
                })}
              </tbody>
            </table> :
            <p>No items yet!</p>
          }
        </div>
      </div>
      <div className="col-4 p-4 bg-gradient bg-secondary bg-opacity-25 edit-sidebar vh-100">
        <h3>Add an item</h3>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-3">
            <label className="form-label" htmlFor="titleInput">Title</label>
            <input id="titleInput" placeholder="What do you need to do?" type="text" className="form-control" value={title} onChange={handleChange} />
          </div>
          <button className="btn btn-small btn-outline-primary px-3" type="submit">Add<i className="material-icons ms-4 align-top">send</i></button>
          <button className="btn btn-small btn-outline-primary px-3 mx-1" type="button" onClick={handleEvaluate}>Feedback<i className="material-icons ms-4 align-top">question_mark</i></button>
        </form>
        <div className="py-3">
          <h3>Copilot feedback</h3>
          <div className="mb-3">{feedback}</div>
        </div>
      </div>
    </div>
  </>;
}