(() => {
	const storageKey = "murmur.profile.v1";
	const defaultProfile = {
		displayName: "Avery Lane",
		bio: "Collecting little moments, good sentences & places with really good pastries.",
		avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=85",
		banner: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=85",
		followingCount: 482,
		followedUsers: [],
		followerCounts: { theo: 2400 },
		posts: []
	};

	function readProfile() {
		try {
			const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
			return {
				...defaultProfile,
				...saved,
				followedUsers: Array.isArray(saved.followedUsers) ? saved.followedUsers : [],
				followerCounts: { ...defaultProfile.followerCounts, ...saved.followerCounts },
				posts: Array.isArray(saved.posts) ? saved.posts : []
			};
		} catch {
			return { ...defaultProfile, followedUsers: [], followerCounts: { ...defaultProfile.followerCounts } };
		}
	}

	let profile = readProfile();

	function saveProfile() {
		try {
			localStorage.setItem(storageKey, JSON.stringify(profile));
			return true;
		} catch {
			return false;
		}
	}

	function setStatus(message) {
		const status = document.querySelector("[data-profile-status]");
		if (status) status.textContent = message;
	}

	function formatPostTime(value) {
		const date = new Date(value);
		const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
		if (minutes < 1) return "now";
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h`;
		return `${Math.floor(hours / 24)}d`;
	}

	function createPostCard(post, isOwnProfile) {
		const article = document.createElement("article");
		article.className = isOwnProfile ? "post profile-post" : "post";
		article.dataset.postId = post.id;

		const header = document.createElement("div");
		header.className = "post-header";
		const avatar = document.createElement("img");
		avatar.className = "avatar";
		avatar.src = profile.avatar;
		avatar.alt = profile.displayName;
		const byline = document.createElement("div");
		byline.className = "post-byline";
		const author = document.createElement("a");
		author.className = "display-name";
		author.href = "profile.html";
		author.textContent = profile.displayName;
		const handle = document.createElement("span");
		handle.className = "handle";
		handle.textContent = "@averylane";
		const dot = document.createElement("span");
		dot.className = "post-dot";
		dot.textContent = "·";
		const time = document.createElement("time");
		time.dateTime = post.createdAt;
		time.textContent = formatPostTime(post.createdAt);
		byline.append(author, handle, dot, time);
		header.append(avatar, byline);
		article.append(header);

		const content = document.createElement("div");
		content.className = "post-content";
		if (post.text) {
			const paragraph = document.createElement("p");
			paragraph.textContent = post.text;
			content.append(paragraph);
		}
		if (post.images.length === 1) {
			const image = document.createElement("img");
			image.className = "post-image";
			image.src = post.images[0];
			image.alt = "Image attached to post";
			content.append(image);
		} else if (post.images.length > 1) {
			const grid = document.createElement("div");
			grid.className = "photo-grid new-post-image-grid";
			grid.setAttribute("aria-label", `${post.images.length} images attached to post`);
			post.images.forEach((source, index) => {
				const image = document.createElement("img");
				image.src = source;
				image.alt = `Image ${index + 1} attached to post`;
				grid.append(image);
			});
			content.append(grid);
		}
		article.append(content);

		const actions = document.createElement("div");
		actions.className = "post-actions";
		const like = document.createElement("button");
		like.className = `action-link post-like-action${post.liked ? " is-liked" : ""}`;
		like.type = "button";
		like.setAttribute("aria-label", post.liked ? "Unlike post" : "Like post");
		like.setAttribute("aria-pressed", String(Boolean(post.liked)));
		const heart = document.createElement("span");
		heart.className = "heart";
		heart.setAttribute("aria-hidden", "true");
		heart.textContent = post.liked ? "♥" : "♡";
		const likeCount = document.createElement("span");
		likeCount.textContent = String(post.likes || 0);
		like.append(heart, likeCount);
		like.addEventListener("click", () => {
			const previousLiked = Boolean(post.liked);
			const previousLikes = Number(post.likes) || 0;
			post.liked = !previousLiked;
			post.likes = Math.max(0, previousLikes + (post.liked ? 1 : -1));
			if (!saveProfile()) {
				post.liked = previousLiked;
				post.likes = previousLikes;
				return;
			}
			renderProfile();
		});

		const commentLink = document.createElement("a");
		commentLink.className = "action-link comment-count-link";
		commentLink.href = `#comments-${post.id}`;
		const commentIcon = document.createElement("span");
		commentIcon.setAttribute("aria-hidden", "true");
		commentIcon.textContent = "◷";
		const commentCount = document.createElement("span");
		commentCount.textContent = String(post.comments.length);
		commentLink.append(commentIcon, commentCount);
		actions.append(like, commentLink);
		article.append(actions);

		const comments = document.createElement("details");
		comments.className = "comments";
		comments.id = `comments-${post.id}`;
		comments.open = post.comments.length > 0;
		const summary = document.createElement("summary");
		summary.textContent = post.comments.length ? `View ${post.comments.length} replies` : "Write the first reply";
		comments.append(summary);
		if (post.comments.length) {
			const replies = document.createElement("div");
			replies.className = "post-reply-list";
			post.comments.forEach((comment) => {
				const reply = document.createElement("div");
				reply.className = "comment-preview";
				const replyAvatar = document.createElement("img");
				replyAvatar.className = "tiny-avatar";
				replyAvatar.src = profile.avatar;
				replyAvatar.alt = "";
				const replyText = document.createElement("p");
				const replyAuthor = document.createElement("strong");
				replyAuthor.textContent = comment.author || profile.displayName;
				replyText.append(replyAuthor, document.createTextNode(comment.text));
				reply.append(replyAvatar, replyText);
				replies.append(reply);
			});
			comments.append(replies);
		}
		const replyForm = document.createElement("form");
		replyForm.className = "comment-form";
		const replyInput = document.createElement("input");
		replyInput.type = "text";
		replyInput.maxLength = 500;
		replyInput.placeholder = "Write a reply…";
		replyInput.setAttribute("aria-label", "Write a reply");
		replyInput.required = true;
		const replyButton = document.createElement("button");
		replyButton.type = "submit";
		replyButton.setAttribute("aria-label", "Send reply");
		replyButton.textContent = "↗";
		replyForm.append(replyInput, replyButton);
		replyForm.addEventListener("submit", (event) => {
			event.preventDefault();
			const text = replyInput.value.trim();
			if (!text) return;
			post.comments.push({ author: profile.displayName, text, createdAt: new Date().toISOString() });
			if (!saveProfile()) {
				post.comments.pop();
				return;
			}
			renderProfile();
		});
		comments.append(replyForm);
		article.append(comments);
		return article;
	}

	function renderPosts() {
		document.querySelectorAll("[data-public-posts]").forEach((container) => {
			container.replaceChildren(...profile.posts.map((post) => createPostCard(post, false)));
		});
		document.querySelectorAll("[data-own-posts]").forEach((container) => {
			container.replaceChildren(...profile.posts.map((post) => createPostCard(post, true)));
		});
		document.querySelectorAll("[data-post-count]").forEach((element) => {
			element.textContent = String(128 + profile.posts.length);
		});
	}

	function renderProfile() {
		const name = profile.displayName || defaultProfile.displayName;
		document.querySelectorAll("[data-own-name]").forEach((element) => {
			element.textContent = name;
		});
		if (document.querySelector("#own-profile-name")) {
			document.querySelectorAll(".profile-post .post-byline .display-name").forEach((element) => {
				element.textContent = name;
			});
		}
		document.querySelectorAll("[data-own-bio]").forEach((element) => {
			element.textContent = profile.bio;
		});
		document.querySelectorAll("[data-own-avatar], .own-profile-page .profile-post .avatar, .own-profile-page .profile-large-avatar").forEach((image) => {
			image.src = profile.avatar;
			image.alt = name;
		});
		document.querySelectorAll("[data-own-banner]").forEach((image) => {
			image.src = profile.banner;
		});
		document.querySelectorAll("[data-following-count]").forEach((element) => {
			element.textContent = profile.followingCount.toLocaleString();
		});

		const nameInput = document.querySelector("#display-name");
		const bioInput = document.querySelector("#own-bio");
		if (nameInput) nameInput.value = name;
		if (bioInput) bioInput.value = profile.bio;

		document.querySelectorAll("[data-follow-user]").forEach((button) => {
			const isFollowing = profile.followedUsers.includes(button.dataset.followUser);
			button.textContent = isFollowing ? "✓ Following" : "＋ Follow";
			button.classList.toggle("is-following", isFollowing);
			button.setAttribute("aria-pressed", String(isFollowing));
		});
		document.querySelectorAll("[data-follower-count]").forEach((element) => {
			const count = profile.followerCounts[element.dataset.followerCount] ?? 0;
			element.textContent = count.toLocaleString();
		});
		renderPosts();
	}

	function fileToImageData(file, maxDimension) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onerror = () => reject(new Error("Could not read that image."));
			reader.onload = () => {
				const image = new Image();
				image.onerror = () => reject(new Error("That file is not a supported image."));
				image.onload = () => {
					const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
					const canvas = document.createElement("canvas");
					canvas.width = Math.round(image.width * scale);
					canvas.height = Math.round(image.height * scale);
					const context = canvas.getContext("2d");
					context.fillStyle = "#ffffff";
					context.fillRect(0, 0, canvas.width, canvas.height);
					context.drawImage(image, 0, 0, canvas.width, canvas.height);
					resolve(canvas.toDataURL("image/jpeg", 0.84));
				};
				image.src = reader.result;
			};
			reader.readAsDataURL(file);
		});
	}

	const editForm = document.querySelector(".profile-edit-form");
	if (editForm) {
		editForm.addEventListener("submit", (event) => {
			event.preventDefault();
			const nextName = document.querySelector("#display-name").value.trim();
			profile.displayName = nextName || defaultProfile.displayName;
			profile.bio = document.querySelector("#own-bio").value.slice(0, 200);
			setStatus(saveProfile() ? "Profile saved." : "Could not save. Try a smaller image or clear some browser storage.");
			renderProfile();
		});
	}

	const composerForm = document.querySelector(".composer form");
	if (composerForm) {
		const textInput = composerForm.querySelector("#post-text");
		const imageInput = composerForm.querySelector("#post-images");
		const characterCount = composerForm.querySelector("[data-char-count]");
		const status = composerForm.querySelector("[data-post-status]");
		const updateCharacterCount = () => {
			characterCount.textContent = `${textInput.value.length} / 800`;
		};
		textInput.addEventListener("input", updateCharacterCount);
		imageInput.addEventListener("change", () => {
			if (imageInput.files.length > 4) {
				imageInput.value = "";
				status.textContent = "Choose up to 4 images per post.";
				return;
			}
			status.textContent = imageInput.files.length ? `${imageInput.files.length} image${imageInput.files.length === 1 ? "" : "s"} ready to share.` : "";
		});
		composerForm.addEventListener("submit", async (event) => {
			event.preventDefault();
			const text = textInput.value.trim();
			const files = Array.from(imageInput.files).slice(0, 4);
			if (!text && files.length === 0) {
				status.textContent = "Write a note or add an image before sharing.";
				return;
			}
			const submitButton = composerForm.querySelector("button[type='submit']");
			submitButton.disabled = true;
			status.textContent = "Preparing your note…";
			try {
				const images = await Promise.all(files.map((file) => fileToImageData(file, 1280)));
				const post = {
					id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
					text,
					images,
					createdAt: new Date().toISOString(),
					likes: 0,
					liked: false,
					comments: []
				};
				profile.posts.unshift(post);
				if (!saveProfile()) {
					profile.posts.shift();
					status.textContent = "Could not save this post. Try fewer or smaller images.";
					return;
				}
				textInput.value = "";
				imageInput.value = "";
				updateCharacterCount();
				status.textContent = "Your note is shared.";
				renderProfile();
			} catch {
				status.textContent = "Could not load one of those images. Choose a different file.";
			} finally {
				submitButton.disabled = false;
			}
		});
	}

	[
		{ id: "own-avatar", key: "avatar", maxDimension: 640, label: "Profile picture updated." },
		{ id: "own-banner", key: "banner", maxDimension: 1600, label: "Banner image updated." }
	].forEach(({ id, key, maxDimension, label }) => {
		const input = document.getElementById(id);
		if (!input) return;
		input.addEventListener("change", async () => {
			const [file] = input.files;
			if (!file) return;
			try {
				profile[key] = await fileToImageData(file, maxDimension);
				setStatus(saveProfile() ? label : "Could not save this image. Try a smaller file.");
				renderProfile();
			} catch {
				setStatus("Could not load that image. Choose a different file.");
			} finally {
				input.value = "";
			}
		});
	});

	document.querySelectorAll("[data-follow-user]").forEach((button) => {
		button.addEventListener("click", () => {
			const user = button.dataset.followUser;
			const wasFollowing = profile.followedUsers.includes(user);
			profile.followedUsers = wasFollowing
				? profile.followedUsers.filter((followedUser) => followedUser !== user)
				: [...profile.followedUsers, user];
			profile.followingCount = Math.max(0, profile.followingCount + (wasFollowing ? -1 : 1));
			profile.followerCounts[user] = Math.max(0, (profile.followerCounts[user] ?? 0) + (wasFollowing ? -1 : 1));
			const saved = saveProfile();
			renderProfile();
			button.setAttribute("title", saved ? "Follow state saved" : "Could not save follow state");
		});
	});

	window.addEventListener("storage", (event) => {
		if (event.key === storageKey) {
			profile = readProfile();
			renderProfile();
		}
	});

	renderProfile();
})();